/**
 * POST /api/quote — the only server-rendered route. Runs on the Cloudflare
 * Worker; everything else on the site is static.
 *
 * Flow: honeypot → parse/validate → Turnstile (when configured) → Resend
 * notification to the business (+ optional customer confirmation) → JSON for
 * fetch() callers, or a redirect for plain form posts (no JavaScript).
 *
 * Secrets come from astro:env (see astro.config.mjs): RESEND_API_KEY,
 * TURNSTILE_SECRET_KEY, RESEND_FROM, QUOTE_TO, SEND_CUSTOMER_CONFIRMATION.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { RESEND_API_KEY, RESEND_FROM, QUOTE_TO, TURNSTILE_SECRET_KEY, SEND_CUSTOMER_CONFIRMATION } from 'astro:env/server';
import { TURNSTILE_SITE_KEY } from 'astro:env/client';
import { business } from '../../data/business';
import { parseQuote, businessEmail, customerEmail, idempotencyKey } from '../../lib/quote';

const FALLBACK = `Something went wrong sending your request. Please ${business.phone ? 'call or text us' : 'email us'} instead.`;

function respond(request: Request, ok: boolean, message: string, status: number, redirectTo: string) {
  const wantsJson = request.headers.get('accept')?.includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify({ ok, message }), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  return Response.redirect(new URL(redirectTo, request.url), 303);
}

// Turnstile is enforced only when the widget was built into the form (site key) AND the
// secret is on the Worker. A secret without a site key would otherwise reject every request.
const turnstileEnabled = Boolean(TURNSTILE_SECRET_KEY && TURNSTILE_SITE_KEY);

async function verifyTurnstile(token: string | null, ip: string | null): Promise<boolean> {
  if (!turnstileEnabled) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret: TURNSTILE_SECRET_KEY!, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}

async function send(payload: Record<string, unknown>, key: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const errorTo = '/quote/error';
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(request, false, 'Invalid form submission.', 400, errorTo);
  }

  // Honeypot: bots fill every field. Pretend it worked.
  if ((form.get('company') as string | null)?.trim()) {
    return respond(request, true, 'Thanks. We got your request.', 200, '/quote/thanks');
  }

  const parsed = parseQuote(form);
  if (!parsed.ok) return respond(request, false, parsed.message, 400, errorTo);
  const q = parsed.data;

  const ip = request.headers.get('cf-connecting-ip') ?? clientAddress ?? null;
  if (!(await verifyTurnstile(form.get('cf-turnstile-response') as string | null, ip))) {
    return respond(request, false, 'Verification failed — please try again.', 400, errorTo);
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set; quote request not sent', q);
    return respond(request, false, FALLBACK, 500, errorTo);
  }

  const key = await idempotencyKey(q);
  const to = QUOTE_TO ?? business.email;
  const from = RESEND_FROM ?? `${business.name} Website <onboarding@resend.dev>`;

  try {
    const mail = businessEmail(q);
    await send(
      {
        from,
        to: [to],
        reply_to: q.email ?? undefined,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        tags: [{ name: 'type', value: 'quote' }],
      },
      key,
    );

    if (SEND_CUSTOMER_CONFIRMATION && q.email) {
      const conf = customerEmail(q);
      await send(
        {
          from,
          to: [q.email],
          reply_to: to,
          subject: conf.subject,
          text: conf.text,
          html: conf.html,
          tags: [{ name: 'type', value: 'quote-confirmation' }],
        },
        `${key}/confirm`,
      );
    }
  } catch (err) {
    console.error('Quote email failed', err);
    return respond(request, false, FALLBACK, 502, errorTo);
  }

  return respond(
    request,
    true,
    'Thanks. We got your request and will reply within 24 hours with pricing and dates.',
    200,
    '/quote/thanks',
  );
};

export const GET: APIRoute = () =>
  new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });

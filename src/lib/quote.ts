/**
 * Quote request handling shared by the API route: parsing, validation, email
 * composition. Pure functions — no I/O — so they're easy to test.
 */
import { packages } from '../data/packages';
import { business, formatPhone } from '../data/business';

export interface QuoteRequest {
  name: string;
  phone: string;
  email: string | null;
  vehicle: string;
  packageSlug: string | null;
  packageName: string;
  notes: string;
}

const VEHICLES = new Set(['Sedan / Mid-size SUV', 'Truck', '3-Row Vehicle']);
const clean = (v: FormDataEntryValue | null, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function parseQuote(form: FormData): { ok: true; data: QuoteRequest } | { ok: false; message: string } {
  const name = clean(form.get('name'), 80);
  const phone = clean(form.get('phone'), 30);
  const emailRaw = clean(form.get('email'), 120);
  const vehicleRaw = clean(form.get('vehicle'), 40);
  const slug = clean(form.get('package'), 40);
  const notes = clean(form.get('notes'), 2000);

  if (name.length < 2) return { ok: false, message: 'Please enter your name.' };
  if (phone.replace(/\D/g, '').length < 7) return { ok: false, message: 'Please enter a phone number we can reach you at.' };
  if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) return { ok: false, message: "That email doesn't look right." };

  const pkg = packages.find((p) => p.slug === slug) ?? null;
  return {
    ok: true,
    data: {
      name,
      phone,
      email: emailRaw || null,
      vehicle: VEHICLES.has(vehicleRaw) ? vehicleRaw : 'Not specified',
      packageSlug: pkg?.slug ?? null,
      packageName: pkg?.name ?? 'Not sure (needs a recommendation)',
      notes,
    },
  };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Notification to the business. */
export function businessEmail(q: QuoteRequest) {
  const subject = `Quote request: ${q.name} · ${q.packageName}`;
  const rows: [string, string][] = [
    ['Name', q.name],
    ['Phone', q.phone],
    ['Email', q.email ?? '—'],
    ['Vehicle', q.vehicle],
    ['Package', q.packageName],
    ['Notes', q.notes || '—'],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nSent from the ${business.name} website quote form.`;
  const html = `<!doctype html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
  <h2 style="margin:0 0 12px">New quote request</h2>
  <table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#666;padding-right:16px;vertical-align:top"><b>${k}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join('')}</table>
  <p style="margin-top:16px"><a href="tel:${esc(q.phone)}">Call ${esc(q.phone)}</a> · <a href="sms:${esc(q.phone)}">Text</a>${
    q.email ? ` · <a href="mailto:${esc(q.email)}">Reply by email</a>` : ''
  }</p>
  <p style="color:#888;font-size:12px">Sent from the ${business.name} website quote form.</p></body>`;
  return { subject, text, html };
}

/** Optional confirmation to the customer (only when they gave an email). */
export function customerEmail(q: QuoteRequest) {
  const subject = `We got your quote request · ${business.name}`;
  const phoneLine = business.phone ? ` or ${business.acceptsSms ? 'call/text' : 'call'} ${formatPhone(business.phone)}` : '';
  const text = `Hi ${q.name},

Thanks for contacting ${business.name}. ${business.responseTime}

What you sent us:
Vehicle: ${q.vehicle}
Package: ${q.packageName}
${q.notes ? `Notes: ${q.notes}\n` : ''}
Need to add something? Just reply to this email${phoneLine}.

— ${business.owners}
${business.name} · ${business.descriptor} · ${business.serviceArea ?? ''}`;
  const html = `<!doctype html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
  <p>Hi ${esc(q.name)},</p>
  <p>Thanks for contacting ${business.name}. ${esc(business.responseTime)}</p>
  <p style="color:#666"><b>What you sent us</b><br>Vehicle: ${esc(q.vehicle)}<br>Package: ${esc(q.packageName)}${
    q.notes ? `<br>Notes: ${esc(q.notes)}` : ''
  }</p>
  <p>Need to add something? Just reply to this email${esc(phoneLine)}.</p>
  <p>— ${esc(business.owners)}<br><span style="color:#888;font-size:12px">${business.name} · ${business.descriptor} · ${esc(
    business.serviceArea ?? '',
  )}</span></p></body>`;
  return { subject, text, html };
}

/** Stable key so a double-click can't send two emails (Resend keeps it 24h). */
export async function idempotencyKey(q: QuoteRequest): Promise<string> {
  const bucket = Math.floor(Date.now() / 60000); // one-minute window
  const data = new TextEncoder().encode(`${q.name}|${q.phone}|${q.packageSlug}|${q.notes}|${bucket}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return 'quote/' + [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

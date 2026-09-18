/**
 * Business facts — the single source of truth for the header, footer, quote page,
 * JSON-LD and email templates.
 *
 * Anything `null` is not yet confirmed by the client (see docs/PLAN.md §0) and is
 * simply not rendered until it is filled in. Do not put placeholder text here —
 * it would ship.
 */
export const business = {
  name: 'SS Detail',
  legalName: null as string | null, // TODO(client): legal name for the © line
  tagline: 'Showroom Shine Auto Detailing',
  shortTagline: 'Showroom Shine Detailing',
  /** How the old site described the business — used for SEO titles and the hero. */
  descriptor: 'Mobile Car Detailing',
  /** Old site: "Complimentary consultation available". */
  consultation: 'Complimentary consultation with every quote.',
  /** Shown under the wordmark in the logo. */
  owners: 'Samuel Pacich & Shane Hughes',

  email: 'sscardetailingca@gmail.com',
  /** E.164 digits only, e.g. "+19495551234". Used for tel:/sms: links and JSON-LD. */
  phone: '+18057959932' as string | null, // from ssdetail.com
  /** Set to false if the owner does not want SMS. */
  acceptsSms: true,

  /** From ssdetail.com: "Ventura County and LA County". */
  serviceArea: 'Ventura County & LA County' as string | null,
  serviceAreaShort: 'Ventura & LA County',
  /** "mobile" (we come to you), "shop" (drop-off), or "both" — TODO(client) */
  serviceModel: 'mobile' as 'mobile' | 'shop' | 'both' | null, // "We come to you!" (ssdetail.com)
  /** Street address only if there is a shop customers visit. */
  address: null as { street: string; city: string; region: string; postal: string } | null,

  /** Free-form, e.g. "Mon–Sat 8am–6pm" — TODO(client) */
  hours: null as string | null,

  instagram: 'https://www.instagram.com/sscardetailingandcleaning' as string | null,
  instagramHandle: 'sscardetailingandcleaning',
  googleBusiness: null as string | null, // TODO(client): full URL
  googleRating: null as { value: number; count: number } | null,

  /** Canonical site URL — the client's existing domain (currently Squarespace; cutover in Phase 5). */
  siteUrl: 'https://ssdetail.com',

  responseTime: 'We typically reply within 24 hours with pricing and next available dates.',
} as const;

export type Business = typeof business;

/** "+19495551234" → "(949) 555-1234" for display. */
export function formatPhone(e164: string): string {
  const d = e164.replace(/\D/g, '');
  const n = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  return n.length === 10 ? `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}` : e164;
}

/** Facts still missing — logged at build time so nothing is forgotten before launch. */
export function missingFacts(): string[] {
  const missing: string[] = [];
  if (!business.phone) missing.push('phone');
  if (!business.serviceArea) missing.push('serviceArea');
  if (!business.serviceModel) missing.push('serviceModel');
  if (!business.hours) missing.push('hours');
  if (!business.legalName) missing.push('legalName');
  if (!business.instagram) missing.push('instagram');
  if (!business.googleBusiness) missing.push('googleBusiness');
  return missing;
}

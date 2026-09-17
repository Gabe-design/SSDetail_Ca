/**
 * The four detailing packages — single source of truth for the hero Work Order
 * card, the home lineup, the Services & Pricing tickets, the quote form's
 * package list and the JSON-LD offers.
 *
 * Copy is verbatim from the original site except where docs/PLAN.md §3.4 says
 * otherwise (each such change is commented inline).
 */
import type { ImageMetadata } from 'astro';
import maintenanceImg from '../assets/images/package-maintenance.jpg';
import interiorImg from '../assets/images/package-interior.jpg';
import deconImg from '../assets/images/package-decon.jpg';
import premiumImg from '../assets/images/package-premium.jpg';

export interface PriceTier {
  label: string;
  price: number;
}

export interface Addon {
  label: string;
  price: number;
}

export interface Package {
  /** URL-safe id; also the anchor on /services (e.g. /services#premium). */
  slug: string;
  /** Full name, used on tickets and in the form. */
  name: string;
  /** Short name for tight spaces (hero card, bottom bar). */
  shortName: string;
  /** Lowest price across tiers. */
  from: number;
  tiers: PriceTier[];
  /** One-liner used on the ticket. */
  tagline: string;
  /** One-liner used on the home lineup card. */
  short: string;
  includes: string[];
  addons: Addon[];
  /** Extra note shown under the add-ons (optional). */
  note?: string;
  finePrint: string;
  image: ImageMetadata;
  imageAlt: string;
  /** Crop focus for the ticket image. */
  imagePosition?: string;
  /** Highlighted (the Premium ticket has a stronger border on the original). */
  featured?: boolean;
  /** Cadence hint for the lineup strip. */
  bestFor: string;
}

const FINE_PRINT = 'Excessive dirt, pet hair, etc. may result in an additional charge.';

export const packages: Package[] = [
  {
    slug: 'maintenance',
    name: 'Maintenance Detail',
    shortName: 'Maintenance Detail',
    from: 70,
    tiers: [
      { label: 'Sedan / Mid-size SUV', price: 70 },
      { label: 'Trucks & 3-Row', price: 80 },
    ],
    tagline: 'A minor detail service to keep your vehicle in pristine condition. Recommended monthly.',
    short: 'A monthly minor detail to keep your vehicle in pristine, ready-to-drive condition.',
    includes: [
      'Full interior vacuum & wipe down',
      'Exterior hand + foam wash',
      'Hand-dry / blowout, including door jambs',
      'Tires & wheels detailed and dressed',
      'Windows cleaned inside & outside',
      'Plastic trim restoration',
      'Detail spray touch-up for paint protection & shine',
      'Mirrors and screens',
      'Cupholders and compartments',
    ],
    addons: [],
    finePrint: FINE_PRINT,
    image: maintenanceImg,
    imageAlt: 'A grey BMW covered in foam during a maintenance wash in a driveway',
    bestFor: 'Monthly upkeep',
  },
  {
    slug: 'interior',
    name: 'Interior Detail',
    shortName: 'Interior Detail',
    from: 180,
    tiers: [
      { label: 'Sedan / Mid-size SUV / Truck', price: 180 },
      { label: '3-Row Vehicle', price: 210 },
    ],
    tagline: 'This Classic Package is perfect for a vehicle that needs a complete interior reset and refresh.',
    short: 'A complete interior reset — deep scrub, steam, and full crevice cleaning.',
    includes: [
      'Full vacuum',
      'Deep interior scrub and steam / blow-out',
      'Floor mats cleaned and steamed',
      'All cracks & crevices cleaned (cupholders, buttons, seats)',
      'Door jamb wipe-down',
      'Interior window clean',
    ],
    addons: [
      { label: 'Seat Extraction', price: 50 },
      { label: 'Carpet Extraction', price: 50 },
      { label: 'Exterior Add-On', price: 30 },
    ],
    finePrint: FINE_PRINT,
    image: interiorImg,
    imageAlt: 'Freshly detailed black leather rear seats with the door open',
    bestFor: 'Full interior reset',
  },
  {
    slug: 'decon-clay-seal',
    name: 'Decon, Clay, Seal',
    shortName: 'Decon, Clay, Seal',
    from: 185,
    tiers: [{ label: 'All Vehicles', price: 185 }],
    tagline: "Exterior detailing service to decontaminate, protect, and enhance your vehicle's appearance.",
    short: 'Decontamination, clay treatment, and a 6-month+ ceramic sealant to enhance gloss and protect paint.',
    includes: [
      'Foam and hand wash',
      'Tires & wheels deep cleaned and dressed',
      'Decontamination wash with iron remover & clay treatment to remove all bonded contaminants',
      'Ceramic sealant applied to all painted surfaces — enhances gloss and adds long-lasting protection (6+ months with proper maintenance)',
      'Plastic and trim restoration and protection',
      'Adds hydrophobic properties to the vehicle',
      'Exterior + interior windows cleaned',
      'Door jambs washed',
    ],
    addons: [],
    finePrint: FINE_PRINT,
    image: deconImg,
    imageAlt: 'Glossy sealed paint on a dark vehicle after decontamination',
    bestFor: 'Paint protection',
  },
  {
    slug: 'premium',
    // PLAN §3.4: one name everywhere (the original used three variants).
    name: 'Interior & Exterior Premium',
    shortName: 'Int. & Ext. Premium',
    from: 300,
    tiers: [
      { label: 'Sedan / Mid-size SUV / Truck', price: 300 },
      { label: '3-Row Vehicle', price: 330 },
    ],
    tagline:
      'Interior Detail and Decon, Clay, Seal in one — getting your car to an even better condition than a new car on the lot, with protection that will last.',
    short: 'Our full interior and exterior reset in one visit — the complete showroom treatment.',
    includes: ['Decon, Clay, Seal', 'Interior Detail'],
    addons: [
      { label: 'Seat Extraction', price: 35 },
      { label: 'Carpet Extraction', price: 35 },
    ],
    // PLAN §3.4: was "Extraction will remove all stains." — softened (liability).
    note: 'Extraction lifts most stains.',
    finePrint: FINE_PRINT,
    image: premiumImg,
    imageAlt: 'Detailed brown leather interior and clean floor of a white SUV',
    imagePosition: 'center bottom',
    featured: true,
    bestFor: 'The full reset',
  },
];

export const packageBySlug = (slug: string) => packages.find((p) => p.slug === slug);

export const formatPrice = (n: number) => `$${n}`;

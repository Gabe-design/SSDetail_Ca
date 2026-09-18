/**
 * Recent-work gallery. Photos are the client's own, taken from ssdetail.com
 * (legacy/old-site/images) and the previous site (legacy/images).
 */
import type { ImageMetadata } from 'astro';
import porsche718 from '../assets/images/gallery-porsche-718.jpg';
import porsche718Interior from '../assets/images/gallery-porsche-718-interior.jpg';
import porsche718Front from '../assets/images/gallery-porsche-718-front.jpg';
import porsche911 from '../assets/images/gallery-porsche-911.webp';
import maybach from '../assets/images/gallery-maybach.webp';
import bentley from '../assets/images/gallery-bentley.webp';
import m3 from '../assets/images/gallery-m3.webp';
import bentleyInterior from '../assets/images/gallery-bentley-interior.webp';
import tanInterior from '../assets/images/gallery-tan-interior.webp';
import raptor from '../assets/images/gallery-raptor.webp';
import supra from '../assets/images/gallery-supra.webp';
import porsche992 from '../assets/images/gallery-porsche-992.webp';
import finished from '../assets/images/gallery-finished.jpg';
import maintenance from '../assets/images/gallery-maintenance.jpg';
import interior from '../assets/images/gallery-interior.jpg';

export interface GalleryItem {
  image: ImageMetadata;
  alt: string;
  caption: string;
  /** object-position for the crop */
  position?: string;
}

/** Shown on the home page (first six) and in full on /about. */
export const gallery: GalleryItem[] = [
  { image: porsche718, alt: 'Grey Porsche 718 Cayman detailed in a brick driveway in front of a white garage', caption: 'Porsche 718 — Interior & Exterior Premium' },
  { image: porsche718Interior, alt: 'Porsche 718 grey leather interior and steering wheel, spotless after detailing', caption: 'Porsche 718 — interior detail' },
  { image: porsche911, alt: 'Red Porsche 911 with black stripes, freshly detailed in a driveway', caption: 'Porsche 911 — Decon, Clay, Seal' },
  { image: maybach, alt: 'Black Mercedes-Maybach GLS gleaming after an exterior detail', caption: 'Maybach GLS — exterior detail' },
  { image: bentleyInterior, alt: 'Cream leather Bentley interior after an interior detail', caption: 'Bentley — interior reset' },
  { image: m3, alt: 'Black BMW M3 parked under bougainvillea after detailing', caption: 'BMW M3 — full detail' },
  { image: bentley, alt: 'Light blue Bentley Continental GT after a wash and seal', caption: 'Bentley Continental — Protect & Shine' },
  { image: tanInterior, alt: 'Tan leather rear seats, spotless after an interior detail', caption: 'Rear cabin — Interior Detail' },
  { image: finished, alt: 'Black sports car finished in a driveway with the SS Detail mobile van behind it', caption: 'On location — we come to you', position: 'center' },
  { image: raptor, alt: 'White Ford Raptor on a clean driveway after a maintenance detail', caption: 'Ford Raptor — Maintenance Detail' },
  { image: supra, alt: 'Grey Toyota Supra in a driveway after detailing', caption: 'Toyota Supra — Decon, Clay, Seal' },
  { image: porsche992, alt: 'Grey Porsche 911 on a residential street after an exterior detail', caption: 'Porsche 911 — exterior detail' },
  { image: porsche718Front, alt: 'Front of a grey Porsche 718 with glossy paint and clean wheels', caption: 'Porsche 718 — Decon, Clay, Seal' },
  { image: maintenance, alt: 'BMW front interior after a monthly maintenance detail', caption: 'Monthly maintenance detail' },
  { image: interior, alt: 'Brown leather interior and clean floor after a classic interior reset', caption: 'Classic interior reset', position: 'center bottom' },
];

/**
 * Short clips of recent jobs (client footage, encoded to 720×1280 H.264 by
 * ffmpeg from the originals kept locally in legacy/client-videos). Files live
 * in public/videos so they are served as-is; posters go through <Image>.
 *
 * Re-encode recipe (crop removes the editor's black side bars):
 *   ffmpeg -i in.mp4 -vf "crop=W:H:X:0,scale=720:1280,fps=30" -c:v libx264 -crf 27 -preset slow \
 *     -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k out.mp4
 */
import type { ImageMetadata } from 'astro';
import porschePoster from '../assets/images/video-porsche.jpg';
import gmcPoster from '../assets/images/video-gmc-yukon.jpg';
import ramPoster from '../assets/images/video-ram-exterior.jpg';

export interface WorkVideo {
  src: string;
  poster: ImageMetadata;
  title: string;
  caption: string;
  /** seconds, shown as a badge */
  duration: number;
}

export const videos: WorkVideo[] = [
  {
    src: '/videos/porsche.mp4',
    poster: porschePoster,
    title: 'Porsche, full detail',
    caption: 'Pressure wash, wheels, interior and cockpit.',
    duration: 49,
  },
  {
    src: '/videos/gmc-yukon.mp4',
    poster: gmcPoster,
    title: 'GMC Yukon, wash and interior reset',
    caption: 'Foam wash, hand dry, vacuum and wipe-down.',
    duration: 47,
  },
  {
    src: '/videos/ram-exterior.mp4',
    poster: ramPoster,
    title: 'Ram, finished exterior',
    caption: 'Walkaround after an exterior detail.',
    duration: 16,
  },
];

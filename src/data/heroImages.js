export const HERO_IMAGES = [1, 2, 3, 4, 5, 6].map((number) => ({
  id: `hero-${number}`,
  url: `/images/hero-fallback/hero-0${number}.jpg`,
  alt: `Dental Care slideshow image ${number}`,
}));

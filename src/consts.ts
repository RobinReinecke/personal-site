export const SITE_TITLE = 'Robin Reinecke';
export const JOB_TITLE =
  'Senior Software Engineer | Full-Stack | Web Security | Cloud Architecture';
export const SITE_DESCRIPTION =
  'Senior Software Engineer specializing in web security, full-stack development, and cloud-native architecture. A website about me and my (work) life.';

/** Canonical production origin. Used to build absolute URLs for SEO and social tags. */
export const SITE_URL = 'https://robinreinecke.de';
/** Human name behind the site, used in structured data and social attribution. */
export const AUTHOR_NAME = 'Robin Reinecke';
/** BCP-47 locale, mirrored in <html lang> and og:locale. */
export const SITE_LOCALE = 'en_US';
/** Fallback preview image (1200x630) for pages without a generated OG image. */
export const DEFAULT_OG_IMAGE = '/og/default.png';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
] as const;

export const SOCIAL_LINKS = {
  email: 'mail@robinreinecke.de',
  github: 'https://github.com/RobinReinecke',
  linkedin: 'https://www.linkedin.com/in/RobinReinecke/',
  devto: 'https://dev.to/RobinReinecke',
} as const;

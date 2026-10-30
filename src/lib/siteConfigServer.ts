import fs from 'fs';
import path from 'path';
import { SiteConfig, DEFAULT_SITE_CONFIG } from './siteConfig';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'site-config.json');

export function getSiteConfig(): SiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SITE_CONFIG,
        ...parsed,
        hero: { ...DEFAULT_SITE_CONFIG.hero, ...(parsed.hero || {}) },
        menuItems: Array.isArray(parsed.menuItems) && parsed.menuItems.length > 0 ? parsed.menuItems : DEFAULT_SITE_CONFIG.menuItems,
        announcement: { ...DEFAULT_SITE_CONFIG.announcement, ...(parsed.announcement || {}) },
        counters: Array.isArray(parsed.counters) && parsed.counters.length > 0 ? parsed.counters : DEFAULT_SITE_CONFIG.counters,
        about: {
          ...DEFAULT_SITE_CONFIG.about,
          ...(parsed.about || {}),
          stats: Array.isArray(parsed.about?.stats) && parsed.about.stats.length > 0 ? parsed.about.stats : DEFAULT_SITE_CONFIG.about.stats,
          pillars: Array.isArray(parsed.about?.pillars) && parsed.about.pillars.length > 0 ? parsed.about.pillars : DEFAULT_SITE_CONFIG.about.pillars,
          fleet: Array.isArray(parsed.about?.fleet) && parsed.about.fleet.length > 0 ? parsed.about.fleet : DEFAULT_SITE_CONFIG.about.fleet,
        },
        packages: Array.isArray(parsed.packages) && parsed.packages.length > 0 ? parsed.packages : DEFAULT_SITE_CONFIG.packages,
        offers: Array.isArray(parsed.offers) && parsed.offers.length > 0 ? parsed.offers : DEFAULT_SITE_CONFIG.offers,
        contact: {
          ...DEFAULT_SITE_CONFIG.contact,
          ...(parsed.contact || {}),
          faqs: Array.isArray(parsed.contact?.faqs) && parsed.contact.faqs.length > 0 ? parsed.contact.faqs : DEFAULT_SITE_CONFIG.contact.faqs,
        },
      };
    }
  } catch (err) {
    console.error('Error reading site config, using default:', err);
  }
  return DEFAULT_SITE_CONFIG;
}

export function saveSiteConfig(config: SiteConfig): boolean {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving site config:', err);
    return false;
  }
}

export function resetSiteConfig(): boolean {
  return saveSiteConfig(DEFAULT_SITE_CONFIG);
}

import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig, resetSiteConfig } from '@/lib/siteConfigServer';
import { SiteConfig } from '@/lib/siteConfig';

export async function GET() {
  try {
    const config = getSiteConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Failed to get site config:', error);
    return NextResponse.json({ error: 'Failed to retrieve site settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'RESET') {
      resetSiteConfig();
      const config = getSiteConfig();
      return NextResponse.json({ success: true, message: 'Settings reset to default', config });
    }

    const { hero, menuItems, announcement, counters, about, packages, offers, contact } = body;

    const current = getSiteConfig();
    const updated: SiteConfig = {
      hero: {
        ...current.hero,
        ...(hero || {}),
      },
      menuItems: Array.isArray(menuItems) ? menuItems : current.menuItems,
      announcement: {
        ...current.announcement,
        ...(announcement || {}),
      },
      counters: Array.isArray(counters) ? counters : current.counters,
      about: {
        ...current.about,
        ...(about || {}),
        stats: Array.isArray(about?.stats) ? about.stats : current.about.stats,
        pillars: Array.isArray(about?.pillars) ? about.pillars : current.about.pillars,
        fleet: Array.isArray(about?.fleet) ? about.fleet : current.about.fleet,
      },
      packages: Array.isArray(packages) ? packages : current.packages,
      offers: Array.isArray(offers) ? offers : current.offers,
      contact: {
        ...current.contact,
        ...(contact || {}),
        faqs: Array.isArray(contact?.faqs) ? contact.faqs : current.contact.faqs,
      },
    };

    const saved = saveSiteConfig(updated);
    if (!saved) {
      return NextResponse.json({ error: 'Failed to write site settings file' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully', config: updated });
  } catch (error) {
    console.error('Failed to update site config:', error);
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}

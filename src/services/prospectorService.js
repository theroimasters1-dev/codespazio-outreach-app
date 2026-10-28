const axios = require('axios');
const cheerio = require('cheerio');
const geminiService = require('./geminiService');
const storageService = require('./storageService');

class ProspectorService {
  constructor() {
    this.emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  }

  /**
   * Scrapes website content to extract contact info, tech signals, and potential gaps
   */
  async inspectWebsite(url) {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      const response = await axios.get(cleanUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract Title & Meta
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
      
      // Look for emails
      const rawEmails = html.match(this.emailRegex) || [];
      const cleanEmails = [...new Set(rawEmails.map(e => e.toLowerCase()))].filter(e => {
        return !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.svg') && !e.includes('sentry') && !e.includes('wixpress') && !e.includes('example.com');
      });

      // Quick tech signals
      const hasViewport = $('meta[name="viewport"]').length > 0;
      const isWordpress = html.includes('wp-content') || html.includes('wp-includes');
      const hasReact = html.includes('react') || html.includes('_next');
      const hasShopify = html.includes('shopify.com') || html.includes('cdn.shopify.com');

      const gaps = [];
      if (!hasViewport) gaps.push('Not optimized for mobile devices');
      if (isWordpress) gaps.push('Running on legacy WordPress with potential performance/security overhead');
      if (!hasReact && !hasShopify) gaps.push('Lacks modern reactive frontend framework (Next.js/React)');

      return {
        url: cleanUrl,
        title,
        description,
        emails: cleanEmails,
        signals: { hasViewport, isWordpress, hasReact, hasShopify },
        detectedGaps: gaps.join('; ') || 'Needs cloud infrastructure audit & custom software scaling'
      };
    } catch (err) {
      return {
        url: cleanUrl,
        title: '',
        description: '',
        emails: [],
        signals: {},
        detectedGaps: 'Website slow or unresponsive - urgent infrastructure modernization required',
        error: err.message
      };
    }
  }

  /**
   * Main research pipeline: uses Gemini AI + optional real-time website crawler
   */
  async discoverAndEnrichProspects({ niche, location, targetService, count = 5 }) {
    storageService.addLog('ai', `Starting client research for "${niche}" in "${location}" targeting "${targetService}"...`);

    const rawProspects = await geminiService.researchProspects({
      niche,
      location,
      targetService,
      count
    });

    const enriched = [];

    for (const p of rawProspects) {
      let leadEmail = p.contactEmail;
      let extraGaps = p.detectedGaps;

      // If website provided, try lightweight inspection
      if (p.website && (!leadEmail || leadEmail.includes('example.com') || leadEmail.includes('placeholder'))) {
        try {
          const siteData = await this.inspectWebsite(p.website);
          if (siteData.emails && siteData.emails.length > 0) {
            leadEmail = siteData.emails[0];
          }
          if (siteData.detectedGaps) {
            extraGaps = `${p.detectedGaps} | Inspection notes: ${siteData.detectedGaps}`;
          }
        } catch {
          // ignore inspection error and retain AI generated data
        }
      }

      const finalizedLead = {
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        companyName: p.companyName || 'Target Business',
        website: p.website || '',
        contactEmail: leadEmail || `info@${(p.companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        contactName: p.contactName || 'Founder / Technical Lead',
        industry: p.industry || niche,
        location: p.location || location,
        detectedGaps: extraGaps || p.detectedGaps,
        targetService: p.targetService || targetService,
        whyFit: p.whyFit || 'CodeSpazio 500+ successful deployments and bespoke agile engineering fit',
        pitchAngle: p.pitchAngle || 'Modernize architecture and accelerate feature delivery',
        status: 'discovered',
        createdAt: new Date().toISOString(),
        emailThread: []
      };

      storageService.addLead(finalizedLead);
      enriched.push(finalizedLead);
    }

    storageService.addLog('success', `Successfully discovered and analyzed ${enriched.length} qualified prospects for CodeSpazio Solutions!`);
    return enriched;
  }
}

module.exports = new ProspectorService();

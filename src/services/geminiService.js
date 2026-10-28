const { CODESPAZIO_KNOWLEDGE } = require('./codespazioKnowledge');
const storageService = require('./storageService');

class GeminiService {
  constructor() {
    this.defaultModel = 'gemini-3.8-flash';
    this.fallbackModels = [
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1',
      'gemini-3.1-flash',
      'gemini-3.5-flash',
      'gemini-3.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro'
    ];
  }

  getApiKey(overrideKey = null) {
    if (overrideKey && overrideKey.trim()) return overrideKey.trim();
    const settings = storageService.getSettings();
    return settings.gemini?.apiKey?.trim() || process.env.GEMINI_API_KEY || '';
  }

  getModel(overrideModel = null) {
    if (overrideModel && overrideModel.trim()) return overrideModel.trim();
    const settings = storageService.getSettings();
    return settings.gemini?.model?.trim() || this.defaultModel;
  }

  getWhatsAppButtonHtml() {
    const waNumber = '918769892429';
    const waLink = `https://wa.me/${waNumber}?text=Hi+CodeSpazio+team%2C+I+received+your+email+and+want+to+discuss+our+project`;
    return `
<div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">Prefer a quick direct conversation? Connect with our senior tech architect:</p>
  <a href="${waLink}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: 6px; box-shadow: 0 2px 6px rgba(37, 211, 102, 0.35);">
    💬 Connect Directly on WhatsApp (+91 8769892429)
  </a>
</div>`;
  }

  getWhatsAppText() {
    return `\nPrefer WhatsApp? Chat directly with our senior engineering team: https://wa.me/918769892429 (+91 8769892429)`;
  }

  async listAvailableModels(apiKey = null) {
    const key = this.getApiKey(apiKey);
    if (!key) return [];
    
    for (const apiVer of ['v1beta', 'v1']) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVer}/models?key=${encodeURIComponent(key)}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.models)) {
            const models = data.models
              .filter(m => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent'))
              .map(m => m.name.replace(/^models\//, ''));
            if (models.length > 0) return models;
          }
        }
      } catch (e) {
        // Continue to fallback
      }
    }
    return [];
  }

  async callGemini({ prompt, systemInstruction = '', apiKey = null, model = null, temperature = 0.7, maxOutputTokens = 8192, jsonMode = false }) {
    const key = this.getApiKey(apiKey);
    if (!key) {
      throw new Error('Gemini API Key is missing. Please enter your Gemini API key in Settings.');
    }

    const requestedModel = this.getModel(model);
    const standardFallbacks = [
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1',
      'gemini-3.1-flash',
      'gemini-3.5-flash',
      'gemini-3.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro'
    ];

    const modelsToTry = [requestedModel, ...standardFallbacks.filter(m => m !== requestedModel)];
    let lastError = null;

    const contents = [];
    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: `[System Instructions]\n${systemInstruction}` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will strictly represent CodeSpazio Solutions Pvt Ltd and apply critical thinking to every client match.' }]
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const bodyPayload = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens,
        responseMimeType: jsonMode ? 'application/json' : 'text/plain'
      }
    };

    for (const modelCandidate of modelsToTry) {
      for (const apiVer of ['v1beta', 'v1']) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${modelCandidate}:generateContent?key=${encodeURIComponent(key)}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': key
            },
            body: JSON.stringify(bodyPayload)
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;

            // If the API key itself is explicitly invalid, fail immediately with a clear message
            if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID') || errData.error?.status === 'INVALID_ARGUMENT') {
              throw new Error(`Invalid Gemini API Key: ${errMsg}. Please get a fresh free key at aistudio.google.com.`);
            }

            lastError = new Error(`Gemini error on ${modelCandidate} (${apiVer}): ${errMsg}`);
            continue;
          }

          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return text;
          }
        } catch (err) {
          if (err.message.includes('Invalid Gemini API Key')) {
            throw err;
          }
          lastError = err;
        }
      }
    }

    throw lastError || new Error('Failed to query Gemini after testing all available model endpoints.');
  }

  async testApiKey(apiKey, model = null) {
    const key = this.getApiKey(apiKey);
    if (!key) {
      throw new Error('Gemini API key is required. Please paste your key in Settings.');
    }

    // Attempt model discovery on user's API key
    let modelToUse = model || 'gemini-2.5-flash';
    try {
      const discovered = await this.listAvailableModels(key);
      if (discovered.length > 0) {
        if (!model || !discovered.includes(model)) {
          const preferredOrder = [
            'gemini-3.8-flash',
            'gemini-3.5-flash-lite',
            'gemini-3.1',
            'gemini-3.1-flash',
            'gemini-3.5-flash',
            'gemini-3.5-pro',
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
            'gemini-pro'
          ];
          modelToUse = preferredOrder.find(p => discovered.includes(p)) || discovered[0];
        }
      }
    } catch (e) {
      // Ignore discovery errors and proceed to test
    }

    const prompt = 'Respond with "API_KEY_VALID" and confirm connection for CodeSpazio Solutions Pvt Ltd.';
    const system = `You are the AI engine for CodeSpazio Solutions Pvt Ltd (Jaipur, India). Website: https://codespazio.com/. Serving worldwide clients across US, UK, Europe, UAE, and Asia.`;
    
    const response = await this.callGemini({
      prompt,
      systemInstruction: system,
      apiKey: key,
      model: modelToUse,
      temperature: 0.2
    });

    return {
      success: true,
      message: `Gemini API Key is valid and active! Connected using ${modelToUse}.`,
      activeModel: modelToUse,
      sampleResponse: response.trim()
    };
  }

  /**
   * Performs Critical Thinking Diagnosis: Evaluates what service a prospective client genuinely needs.
   * If a company has zero real need, it disallows pitching to protect domain reputation and avoid spamming.
   */
  async diagnoseProspectNeeds({ companyName, website, industry, rawSignals = {} }) {
    const systemInstruction = `You are the Principal Technical Auditor and Needs Diagnostician for CodeSpazio Solutions Pvt Ltd (https://codespazio.com/).
CRITICAL THINKING MANDATE:
Do NOT pitch services blindly. If a company already has a top-tier responsive web app and no mobile app, ONLY pitch mobile app development.
If a startup is pre-product, ONLY pitch MVP rapid sprint.
If a tech firm has high server costs, ONLY pitch DevOps & Kubernetes cloud optimization.
If a company genuinely has NO NEED (e.g. perfect tech stack, no gaps), set isGoodFit to false.`;

    const prompt = `Critically evaluate this prospective client:
Company: ${companyName}
Website: ${website || 'N/A'}
Industry: ${industry || 'Tech / Business'}
Known Signals: ${JSON.stringify(rawSignals)}

CodeSpazio Service Menu:
1. "Bespoke Web Development & Full-Stack Engineering" (MERN, Next.js, Python, PHP)
2. "Native & Cross-Platform Mobile Apps (iOS & Android)"
3. "Cloud Architecture, Kubernetes, Docker & CI/CD DevOps"
4. "Startup & MVP Consulting, Product Strategy & UI/UX"
5. "Custom AI Solutions & Workflow Automation"

Diagnose their primary bottleneck and return ONLY a JSON object:
{
  "isGoodFit": true/false,
  "fitScore": 85,
  "diagnosedPrimaryNeed": "Exact service title from menu above",
  "reasoningWhyNeeded": "Critical rationale explaining why this specific service solves their biggest business bottleneck",
  "servicesToAvoidPitching": "Services they clearly DO NOT need right now",
  "uniqueTeardownObservation": "One sharp technical observation to open the cold email with"
}`;

    const rawJson = await this.callGemini({
      prompt,
      systemInstruction,
      temperature: 0.4,
      jsonMode: true
    });

    return this.safeParseJson(rawJson);
  }

  safeParseJson(rawJson) {
    if (!rawJson) return null;
    let text = typeof rawJson === 'string' ? rawJson.trim() : JSON.stringify(rawJson);
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    text = text.replace(/```\s*$/i, '').trim();

    try {
      return JSON.parse(text);
    } catch (e1) {
      // 1. Repair truncated array of objects
      const firstBracket = text.indexOf('[');
      if (firstBracket !== -1) {
        const arrayBody = text.substring(firstBracket);
        const lastBrace = arrayBody.lastIndexOf('}');
        if (lastBrace !== -1) {
          const cut = arrayBody.substring(0, lastBrace + 1) + ']';
          try {
            return JSON.parse(cut);
          } catch (e2) {
            // continue
          }
        }
      }

      // 2. Repair truncated single object
      const firstBrace = text.indexOf('{');
      if (firstBrace !== -1) {
        const objBody = text.substring(firstBrace);
        const lastComma = objBody.lastIndexOf(',');
        if (lastComma > 0) {
          const cut = objBody.substring(0, lastComma) + '}';
          try {
            return JSON.parse(cut);
          } catch (e3) {
            // continue
          }
        }
      }

      throw new Error(`AI generated truncated response (${e1.message}). Please try again.`);
    }
  }

  async _researchBatch({ niche, location, targetService, count, batchIndex = 1, apiKey = null, model = null }) {
    const systemInstruction = `You are the Senior Technical Scout and Lead Generation Director for CodeSpazio Solutions Pvt Ltd (https://codespazio.com/), Jaipur, Rajasthan, India.
Global Reach: Serving startups and enterprise clients worldwide (United States, United Kingdom, Canada, Australia, Europe, UAE, Singapore, Global).
Credentials: 500+ successful deployments delivered globally, 10+ years deep industry experience, enterprise cloud architectures, bespoke web development, native iOS & Android mobile apps, and DevOps automation.

CRITICAL THINKING MANDATE:
1. Research ${count} distinct companies and founders across global markets who have a demonstrable, verified need for IT modernization.
2. Every prospect must have a DIFFERENT identified bottleneck. Do NOT pitch identical services to all.
3. Critically match the service to their business model (e.g. e-commerce -> speed/mobile app, SaaS -> Kubernetes/cloud cost, early-stage -> MVP).`;

    const prompt = `Perform comprehensive client discovery for:
- Target Industry/Niche: "${niche || 'High Growth Startups, E-commerce, Healthcare, FinTech, & Global SMBs'}"
- Market/Geography: "${location || 'Worldwide (United States, United Kingdom, Canada, Australia, Europe, UAE, Global)'}"
- Primary Service Focus: "${targetService || 'Custom Web Development, Mobile Apps, & Cloud DevOps'}"
- Total Prospects to Discover: ${count}
- Batch Ref: ${batchIndex}

Return ONLY a valid JSON array of ${count} objects structured as:
[
  {
    "companyName": "Company Name",
    "website": "https://example.com",
    "contactEmail": "contact@example.com",
    "contactName": "Full Name (Role)",
    "industry": "Industry category",
    "location": "${location}",
    "detectedGaps": "Specific gap (e.g., slow mobile checkout, lack of native iOS/Android app, manual server deployments)",
    "targetService": "${targetService}",
    "whyFit": "Why CodeSpazio's 500+ project track record specifically solves their issue",
    "pitchAngle": "Angle (e.g. Performance Teardown, Mobile App Expansion, Cloud Cost Reduction, Rapid MVP Sprint)"
  }
]`;

    const rawJson = await this.callGemini({
      prompt,
      systemInstruction,
      apiKey,
      model,
      temperature: 0.7,
      maxOutputTokens: 8192,
      jsonMode: true
    });

    const parsed = this.safeParseJson(rawJson);
    return Array.isArray(parsed) ? parsed : (parsed.prospects || parsed.leads || []);
  }

  async researchProspects({ niche, location, targetService, count = 25, apiKey = null, model = null }) {
    const totalCount = parseInt(count, 10) || 25;
    if (totalCount > 13) {
      const half1 = Math.ceil(totalCount / 2);
      const half2 = totalCount - half1;
      const [batch1, batch2] = await Promise.all([
        this._researchBatch({ niche, location, targetService, count: half1, batchIndex: 1, apiKey, model }),
        this._researchBatch({ niche, location, targetService, count: half2, batchIndex: 2, apiKey, model })
      ]);
      return [...batch1, ...batch2];
    }
    return this._researchBatch({ niche, location, targetService, count: totalCount, batchIndex: 1, apiKey, model });
  }

  /**
   * Generates a hyper-personalized, high-converting B2B cold email pitch.
   * Rotates between 5 distinct copywriting frameworks so EVERY prospect receives a unique email!
   * Automatically embeds CodeSpazio's WhatsApp button (+91 8769892429).
   */
  async generatePersonalizedEmail({ prospect, customInstructions = '', pitchIndex = 0, apiKey = null, model = null }) {
    const settings = storageService.getSettings();
    
    const frameworks = [
      {
        name: "Micro-Teardown & Specific Observation",
        instruction: "Open with a genuine observation about their website/product. Point out a specific friction point or performance opportunity without being insulting. Offer a free 2-minute video teardown or loom comparison."
      },
      {
        name: "Case Study & Peer Benchmark",
        instruction: "Cite CodeSpazio's 500+ deployment milestone. Share how a similar company in their sector reduced load time by 60% or launched their mobile app in 6 weeks with our engineering team."
      },
      {
        name: "Problem-Agitate-Solve (Agile Sprint)",
        instruction: "Focus on feature velocity. Startups & brands often struggle with slow agency turnarounds. Pitch CodeSpazio's rapid 2-week agile sprints with 24/7 support and 100% intellectual property ownership."
      },
      {
        name: "Cloud & Infrastructure Cost Optimization",
        instruction: "Highlight how unoptimized cloud architectures (AWS/GCP/Kubernetes) leak budget. Pitch an architecture & DevOps audit to slash hosting overhead and ensure zero-downtime scaling."
      },
      {
        name: "Low-Friction Strategic Value Offer",
        instruction: "Keep it under 90 words. Short, punchy, consultative. Ask if modernizing their web/mobile application is on their roadmap for Q1/Q2, offering a quick roadmap sketch with zero commitment."
      }
    ];

    const chosenFramework = frameworks[pitchIndex % frameworks.length];

    const systemInstruction = `You are an elite B2B sales copywriter writing for CodeSpazio Solutions Pvt Ltd (https://codespazio.com/).
Global Reach: Clients in USA, UK, Canada, Australia, Europe, UAE, and Worldwide.
CRITICAL MANDATE:
- Every prospect must receive a DIFFERENT, bespoke pitch based on their actual verified need. NEVER use a generic pitch.
- Applied Framework for this email: "${chosenFramework.name}": ${chosenFramework.instruction}
- Facts: 500+ deployments, 10+ years industry experience, 24/7 dedicated support across global timezones, official email official@codespazio.com, phone +91 8769892429, WhatsApp: +91 8769892429.
- Length: 80 to 130 words maximum. Conversational, humble, high-status, human.
- Subject lines must be 2 to 5 words, lowercase or natural capitalization.`;

    const prompt = `Write a unique cold outreach email for:
Prospect Company: ${prospect.companyName}
Website: ${prospect.website || 'N/A'}
Contact: ${prospect.contactName || 'Founder / Team'}
Their Specific Diagnosed Gap: ${prospect.detectedGaps || 'Modernizing digital presence & infrastructure'}
Target Service: ${prospect.targetService || 'Custom Full-Stack Development'}
Selected Angle: ${prospect.pitchAngle || chosenFramework.name}
${customInstructions ? `User Note: ${customInstructions}` : ''}

Sender Signature to use:
${settings.outreach?.signature || 'Best regards,\nCodeSpazio Solutions Pvt Ltd\nhttps://codespazio.com/'}

Return ONLY a JSON object:
{
  "subject": "Unique 2-5 word subject line",
  "body": "Crisp, personalized plain text body",
  "html": "Clean HTML formatted version",
  "frameworkUsed": "${chosenFramework.name}"
}`;

    const rawJson = await this.callGemini({
      prompt,
      systemInstruction,
      apiKey,
      model,
      temperature: 0.7,
      jsonMode: true
    });

    try {
      const parsed = JSON.parse(rawJson);
      parsed.html += this.getWhatsAppButtonHtml();
      parsed.body += this.getWhatsAppText();
      return parsed;
    } catch {
      const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      parsed.html += this.getWhatsAppButtonHtml();
      parsed.body += this.getWhatsAppText();
      return parsed;
    }
  }

  /**
   * Generates automated follow-up emails when prospects have not replied after several days.
   */
  async generateFollowUpEmail({ prospect, previousSubject, followUpStage = 1, apiKey = null, model = null }) {
    const settings = storageService.getSettings();
    const systemInstruction = `You are the Lead Follow-Up Specialist for CodeSpazio Solutions Pvt Ltd (https://codespazio.com/).
MANDATE:
- Keep follow-ups extremely brief (under 80 words).
- Friendly, helpful, zero aggression.
- WhatsApp number: +91 8769892429.`;

    let stageInstruction = '';
    if (followUpStage === 1) {
      stageInstruction = `Stage 1 Follow-up: Quick, polite bump 2-3 days after the initial pitch. Check if they saw the previous note, mention CodeSpazio's 500+ successful deployments, and ask if modernizing ${prospect.detectedGaps || 'their web/mobile software'} is a priority this quarter.`;
    } else if (followUpStage === 2) {
      stageInstruction = `Stage 2 Follow-up: 5-6 days after initial pitch. Offer immense upfront value: propose sending a quick 3-minute video teardown highlighting 2 high-impact fixes for ${prospect.website || prospect.companyName}. Zero cost, no commitment.`;
    } else {
      stageInstruction = `Stage 3 Final Follow-up (Breakup email): 8-10 days after initial pitch. Graciously ask if we should close the loop so we don't crowd their inbox, letting them know we're always available on WhatsApp or email whenever they are ready.`;
    }

    const cleanSubject = previousSubject ? (previousSubject.startsWith('Re:') ? previousSubject : `Re: ${previousSubject}`) : `Re: Collaboration with ${prospect.companyName}`;

    const prompt = `Write a Stage ${followUpStage} follow-up email for:
Prospect: ${prospect.companyName} (${prospect.contactName || 'Team'})
Website: ${prospect.website || 'N/A'}
Service: ${prospect.targetService || 'Custom Software Development'}
Instruction: ${stageInstruction}

Sender Signature:
${settings.outreach?.signature || 'Best regards,\nCodeSpazio Solutions Pvt Ltd\nhttps://codespazio.com/'}

Return ONLY a JSON object:
{
  "subject": "${cleanSubject}",
  "body": "Crisp plain text follow-up body",
  "html": "Clean HTML formatted version",
  "followUpStage": ${followUpStage}
}`;

    const rawJson = await this.callGemini({
      prompt,
      systemInstruction,
      apiKey,
      model,
      temperature: 0.6,
      jsonMode: true
    });

    try {
      const parsed = JSON.parse(rawJson);
      parsed.html += this.getWhatsAppButtonHtml();
      parsed.body += this.getWhatsAppText();
      return parsed;
    } catch {
      const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      parsed.html += this.getWhatsAppButtonHtml();
      parsed.body += this.getWhatsAppText();
      return parsed;
    }
  }

  /**
   * Analyzes an incoming reply from a prospective client to classify their intent, sentiment, and conversion readiness.
   */
  async analyzeIncomingReply({ subject, body, senderEmail, prospectContext = {}, apiKey = null, model = null }) {
    const systemInstruction = `You are the Lead Intelligence Engine for CodeSpazio Solutions Pvt Ltd (https://codespazio.com/).
Analyze incoming client emails to determine their exact stage in the sales pipeline, sentiment, and whether they are ready to convert/hire CodeSpazio or need objection handling.`;

    const prompt = `Analyze this incoming reply:
From: ${senderEmail}
Subject: ${subject}
Message Body:
"""
${body}
"""

Context about this prospect:
Company: ${prospectContext.companyName || 'Unknown'}
Service Offered: ${prospectContext.targetService || 'IT Development / Cloud Services'}

Classify the intent into one of these exact categories:
1. "READY_TO_CONVERT" -> Client says yes, asks for invoice, bank/payment details, contract, onboarding steps, or wants to kick off.
2. "INTERESTED_WANTS_CALL" -> Client wants to meet, schedule a Zoom/Google Meet call, or requests calendar link.
3. "INTERESTED_WANTS_PRICING" -> Client asks how much it costs, asks for quotation, estimate, or rate card.
4. "TECHNICAL_QUESTION" -> Client asks for portfolio, tech stack details, case studies, or reference work.
5. "OBJECTION" -> Client mentions budget constraints, timing issues, or existing in-house team.
6. "NOT_INTERESTED" -> Client politely or firmly declines, unsubscribes, or asks to be removed.
7. "OUT_OF_OFFICE" -> Automated auto-responder.

Return ONLY a JSON object:
{
  "intent": "READY_TO_CONVERT | INTERESTED_WANTS_CALL | INTERESTED_WANTS_PRICING | TECHNICAL_QUESTION | OBJECTION | NOT_INTERESTED | OUT_OF_OFFICE",
  "sentiment": "Positive | Neutral | Hesitant | Negative",
  "confidenceScore": 0.95,
  "summary": "Brief 1-sentence summary of what the prospect said",
  "recommendedAction": "Actionable next step",
  "readyForPayment": true/false
}`;

    const rawJson = await this.callGemini({
      prompt,
      systemInstruction,
      apiKey,
      model,
      temperature: 0.3,
      jsonMode: true
    });

    try {
      return JSON.parse(rawJson);
    } catch {
      const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    }
  }

  /**
   * Generates an intelligent, persuasive conversion reply.
   * If the prospect is ready to convert or asks for pricing/next steps, seamlessly provides payment details and onboarding roadmap!
   * Automatically embeds CodeSpazio's WhatsApp button (+91 8769892429).
   */
  async generateConversionReply({ subject, incomingBody, senderEmail, intentAnalysis, prospectContext = {}, apiKey = null, model = null }) {
    const settings = storageService.getSettings();
    const payment = settings.payment || {};
    
    // Format payment instructions for domestic & international clients
    let paymentBlock = `
PAYMENT & ONBOARDING DETAILS (CodeSpazio Solutions Pvt Ltd):
- Beneficiary: ${payment.accountName || 'CodeSpazio Solutions Pvt Ltd'}
- Bank: ${payment.bankName || 'HDFC Bank'}
- Account Number: ${payment.accountNumber || '[Available upon invoice request]'}
- IFSC Code (Domestic India): ${payment.ifscCode || ''}
- SWIFT / BIC Code (International Wire): ${payment.swiftBic || ''}
- UPI ID (India): ${payment.upiId || ''}
- Online Card / Stripe / Payment Link: ${payment.paymentUrl || 'https://codespazio.com/contact-us'}
- Standard Milestone Terms: ${payment.paymentTerms || '50% advance to initiate sprint development, 50% upon final deployment & delivery.'}
`;

    const systemInstruction = `You are the Lead Solution Architect and Engagement Director at CodeSpazio Solutions Pvt Ltd (https://codespazio.com/), Jaipur, India.
Your mission is to guide prospective clients to a successful partnership and close deals with confidence, clarity, and elegance.
Global Clients: Serving businesses across US, UK, Europe, UAE, and worldwide.
Official WhatsApp: +91 8769892429.

Key guidelines:
1. If intent is "READY_TO_CONVERT" or "INTERESTED_WANTS_PRICING":
   - Thank them enthusiastically for choosing CodeSpazio Solutions.
   - Outline our clear 3-step kickoff process:
     Step 1: Finalize brief & deliverable scope.
     Step 2: 50% kick-off milestone deposit (provide official payment details below).
     Step 3: Dedicated Slack/Teams/WhatsApp channel creation and Day 1 sprint kickoff.
   - Present the payment details cleanly and reassuringly.
2. If intent is "INTERESTED_WANTS_CALL":
   - Express excitement, provide flexible meeting times or invite them to share their preferred time slot.
   - Mention who will be on the call (Senior Technical Architect from CodeSpazio).
3. If intent is "OBJECTION" (e.g., budget or timing):
   - Acknowledge their concern with empathy.
   - Highlight our flexible milestone billing, agile sprint delivery, and zero-bloat approach so they only pay for what brings immediate ROI.
4. If intent is "TECHNICAL_QUESTION":
   - Provide concrete technical answers citing CodeSpazio's 500+ successful deployments, clean architecture, and modern tech stacks (React, Node, Python, iOS/Android, Kubernetes).
5. If intent is "NOT_INTERESTED":
   - Send a graceful, polite 2-line sign-off leaving the door open for future needs.`;

    const prompt = `Draft a closing / follow-up reply to this prospective client:
Prospect Sender: ${senderEmail}
Subject: Re: ${subject}
Incoming Message:
"""
${incomingBody}
"""

Intent Detected: ${intentAnalysis.intent}
Sentiment: ${intentAnalysis.sentiment}
Summary: ${intentAnalysis.summary}

Our Payment Options to include if appropriate:
${intentAnalysis.intent === 'READY_TO_CONVERT' || intentAnalysis.intent === 'INTERESTED_WANTS_PRICING' ? paymentBlock : '(Payment details only if requested)'}

Sender Signature:
${settings.outreach?.signature || 'Best regards,\nCodeSpazio Solutions Pvt Ltd\nofficial@codespazio.com | +91 8769892429\nhttps://codespazio.com/'}

Return ONLY a JSON object:
{
  "subject": "Re: ${subject.replace(/^Re:\s*/i, '')}",
  "body": "Full formatted email response text",
  "html": "Clean HTML formatted version",
  "conversionStage": "Meeting Proposed | Invoice / Payment Sent | Proposal Delivered | Politely Closed"
}`;

    const rawJson = await this.callGemini({
      prompt,
      systemInstruction,
      apiKey,
      model,
      temperature: 0.5,
      jsonMode: true
    });

    try {
      const parsed = JSON.parse(rawJson);
      parsed.html += this.getWhatsAppButtonHtml();
      parsed.body += this.getWhatsAppText();
      return parsed;
    } catch {
      const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      parsed.html += this.getWhatsAppButtonHtml();
      parsed.body += this.getWhatsAppText();
      return parsed;
    }
  }
}

module.exports = new GeminiService();

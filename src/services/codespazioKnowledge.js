/**
 * CodeSpazio Solutions Pvt Ltd - Official Knowledge Base
 * Extracted directly from https://codespazio.com/
 * 
 * Representation: Exclusively represents CodeSpazio Solutions Pvt Ltd.
 * Scope: Global IT Consultancy & Engineering serving clients worldwide.
 */

const CODESPAZIO_KNOWLEDGE = {
  company: {
    name: "CodeSpazio Solutions Pvt Ltd",
    brandName: "CodeSpazio",
    tagline: "Elite Digital Solutions | Where Vision Meets Execution",
    headquarters: "Jaipur, Rajasthan, India",
    globalReach: "Worldwide (United States, United Kingdom, Canada, Australia, Europe, UAE, Singapore, Global)",
    email: "official@codespazio.com",
    phone: "+91 8769892429",
    whatsapp: "+91 8769892429",
    website: "https://codespazio.com/",
    overview: "CodeSpazio Solutions Pvt Ltd is a premier digital technology consultancy and software development powerhouse. We architect enterprise-grade cloud systems, bespoke web and mobile applications, provide advanced DevOps engineering, UI/UX consulting, and artificial intelligence solutions for startups and enterprises worldwide.",
    stats: {
      projectsDelivered: "500+",
      careersLaunched: "200+",
      industryExperience: "10+ years of deep technical expertise",
      clientDelightRate: "99%+",
      support: "24/7 dedicated round-the-clock technical assistance across all global timezones",
      deliveryMethodology: "Agile-first accelerated delivery without compromising code quality"
    }
  },

  // Critical Needs Matching Matrix - Used by AI to diagnose genuine client needs
  needsDiagnosticMatrix: {
    "web-dev": {
      criteria: "Client website is slow, outdated, has poor mobile UX, or lacks modern dynamic web portal capabilities.",
      whoNeedsIt: "E-commerce brands, SaaS platforms, professional services, and SMBs whose existing site fails to convert visitors or has poor Core Web Vitals.",
      whoDoesNotNeedIt: "Companies that recently launched a custom, modern, high-speed Next.js/React web app with excellent lighthouse scores."
    },
    "mobile-apps": {
      criteria: "Client has an online presence or customer portal but lacks dedicated iOS and Android mobile apps, missing out on push notifications and mobile user retention.",
      whoNeedsIt: "Consumer brands, on-demand services, booking platforms, FinTech, fitness, healthcare, and marketplaces.",
      whoDoesNotNeedIt: "B2B backend-only infrastructure firms or companies with already highly-rated active mobile apps on Google Play & App Store."
    },
    "devops-cloud": {
      criteria: "Client runs servers on AWS/GCP/Azure with high monthly bills, manual deployment processes, frequent downtime during spikes, or security vulnerabilities.",
      whoNeedsIt: "Growing SaaS companies, tech startups, multi-tier platforms, and software vendors needing Docker, Kubernetes, CI/CD automation, and server hardening.",
      whoDoesNotNeedIt: "Static brochure websites hosted on simple managed platforms with no backend compute needs."
    },
    "consultancy-mvp": {
      criteria: "Founders and startups with an innovative product concept who need to validate product-market fit fast without burning tens of thousands on unproven features.",
      whoNeedsIt: "Seed-stage startups, entrepreneurs, corporate innovation labs needing a high-fidelity MVP in 4 to 8 weeks.",
      whoDoesNotNeedIt: "Mature enterprises with hundreds of internal in-house developers."
    },
    "ai-solutions": {
      criteria: "Businesses drowning in repetitive customer queries, manual data entry, or needing custom intelligent copilots & automated workflows.",
      whoNeedsIt: "Customer support intensive businesses, logistics, data-heavy SaaS platforms, and digital agencies.",
      whoDoesNotNeedIt: "Businesses with zero digital data or no operational workflows."
    }
  },

  services: [
    {
      id: "web-dev",
      category: "Development Service",
      title: "Bespoke Web Development & Full-Stack Engineering",
      url: "https://codespazio.com/it-services/development-service",
      description: "High-performance, secure, responsive, and scalable web solutions tailored for business operations. Modern stacks: MERN (React, Node.js, Express, MongoDB), Next.js, Python/Django/FastAPI, and PHP.",
      targetProblemsSolved: [
        "Outdated legacy websites that don't convert visitors",
        "Slow loading times and poor Core Web Vitals",
        "Unresponsive or clunky mobile viewing experience",
        "Complex workflows needing bespoke SaaS web portals"
      ],
      deliverables: [
        "Custom responsive frontend design with modern UI/UX",
        "High-throughput backend APIs with robust security & authentication",
        "Database optimization (SQL & NoSQL)",
        "SEO-optimized architecture and lightning-fast load times"
      ]
    },
    {
      id: "mobile-apps",
      category: "Development Service",
      title: "Native & Cross-Platform Mobile App Development (iOS & Android)",
      url: "https://codespazio.com/it-services/development-service",
      description: "Bespoke iOS and Android mobile applications engineered with premium UI/UX, robust offline capabilities, push notifications, and App Store / Play Store deployment.",
      targetProblemsSolved: [
        "Businesses lacking a mobile app to engage their customer base",
        "Low user retention and poor mobile engagement",
        "Cross-platform inconsistency or lagging native performance"
      ],
      deliverables: [
        "Native iOS App (Swift/SwiftUI) with Apple HIG standards",
        "Native Android App (Kotlin/Jetpack Compose) with Material Design 3",
        "Cross-platform apps (React Native / Flutter) for single-codebase efficiency",
        "Secure payment gateway integrations, biometric auth, cloud synchronization"
      ]
    },
    {
      id: "devops-cloud",
      category: "DevOps and Cloud Computing",
      title: "Cloud Architecture, Kubernetes, Docker & CI/CD DevOps",
      url: "https://codespazio.com/it-services/devops-and-cloud-computing",
      description: "Enterprise-grade cloud architectures, automated CI/CD deployment pipelines, microservices containerization, proactive server administration, and DevSecOps compliance.",
      targetProblemsSolved: [
        "Frequent server downtime, crashes during traffic spikes",
        "Manual error-prone deployments delaying feature releases",
        "Skyrocketing cloud bills on AWS/GCP/Azure with unoptimized resources",
        "Vulnerabilities, data breaches, and lack of automated backup systems"
      ],
      deliverables: [
        "Automated CI/CD pipelines (GitHub Actions, Jenkins, GitLab)",
        "Docker containerization & Kubernetes cluster orchestration",
        "Cloud cost optimization and automated auto-scaling",
        "24/7 Managed Server Administration, proactive monitoring and zero-downtime migrations",
        "DevSecOps compliance, automated security scans, firewall & TLS hardening"
      ]
    },
    {
      id: "consultancy-mvp",
      category: "Consultancy",
      title: "Startup & MVP Consulting, Product Strategy & Architecture Audit",
      url: "https://codespazio.com/it-services/consultancy",
      description: "Strategic roadmap planning, system architecture audit, rapid MVP development for startups to validate ideas, and high-converting UI/UX design systems.",
      targetProblemsSolved: [
        "Startups wasting budget on over-engineered software before finding product-market fit",
        "Lack of technical leadership or software architecture guidance",
        "Confusing user journeys causing high drop-off rates"
      ],
      deliverables: [
        "Rapid MVP development in 4-8 weeks to launch fast",
        "Comprehensive code & infrastructure architecture audit",
        "Figma UI/UX wireframing, interactive prototypes, and design systems",
        "Go-to-market technology strategy and scalable tech stack selection"
      ]
    },
    {
      id: "ai-ml-solutions",
      category: "AI & Innovation",
      title: "AI Integration, Machine Learning & Automation",
      url: "https://codespazio.com/it-services",
      description: "Custom AI-driven solutions, intelligent workflow automation, generative AI integrations, neural network models, and business intelligence dashboards.",
      targetProblemsSolved: [
        "Repetitive manual tasks eating up human staff hours",
        "Unutilized customer data sitting idle without actionable intelligence",
        "Need for 24/7 AI-powered customer engagement or smart copilots"
      ],
      deliverables: [
        "Custom AI Copilots & GenAI workflow integrations",
        "Automated data pipelines, NLP models, and smart chatbots",
        "Predictive analytics and business intelligence dashboards"
      ]
    }
  ],

  testimonials: [
    {
      quote: "This IT company provides excellent services with a highly professional team. Their technical expertise, timely delivery, and customer support are truly impressive. I am very satisfied with the quality of work and would highly recommend them.",
      source: "Verified Client Review on codespazio.com"
    },
    {
      quote: "Outstanding service, professional communication, and excellent technical knowledge. One of the best IT companies I have worked with.",
      source: "Verified Client Review on codespazio.com"
    },
    {
      quote: "Their DevOps implementation was comprehensive, practical, and aligned with industry standards. Hands-on experience with tools and technologies used in real-world environments.",
      source: "Verified Review on codespazio.com"
    }
  ],

  valuePropositions: [
    "500+ successful deployments delivered for clients worldwide.",
    "Bespoke engineering with zero bloat - clean, maintainable, scalable code.",
    "Agile-first sprints: frequent demos, transparent milestone tracking.",
    "24/7 dedicated support & SLA guarantees across US, European, and Asian timezones.",
    "Full intellectual property ownership & NDA protection from day 1.",
    "Flexible engagement models: Fixed price milestone-based, Dedicated Developer retainers, or Hourly sprints."
  ]
};

module.exports = { CODESPAZIO_KNOWLEDGE };

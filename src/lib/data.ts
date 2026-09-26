export type Category =
  | "Writing"
  | "Coding"
  | "Marketing"
  | "Data"
  | "Design"
  | "Productivity";

export const categories: Category[] = [
  "Writing",
  "Coding",
  "Marketing",
  "Data",
  "Design",
  "Productivity",
];

export type Review = {
  author: string;
  rating: number;
  comment: string;
};

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  creator: string;
  price: number;
  rating: number;
  reviewCount: number;
  users: number;
  gradient: string;
  initials: string;
  features: string[];
  samplePrompts: string[];
  systemPrompt: string;
  reviews: Review[];
  featured?: boolean;
};

export const tools: Tool[] = [
  {
    slug: "copycraft",
    name: "CopyCraft",
    tagline: "High-converting marketing copy in seconds",
    description:
      "CopyCraft writes landing pages, ad variations, and product descriptions tuned to your brand voice. Feed it a product brief and get dozens of on-brand variations ready to A/B test.",
    category: "Marketing",
    creator: "Lumen Labs",
    price: 19,
    rating: 4.8,
    reviewCount: 1284,
    users: 48200,
    gradient: "from-fuchsia-500 to-pink-500",
    initials: "CC",
    features: [
      "Brand voice training",
      "Ad copy for Google, Meta & LinkedIn",
      "Bulk variation generator",
      "SEO meta descriptions",
    ],
    samplePrompts: [
      "Write 3 Facebook ad headlines for a vegan protein bar",
      "Create a hero section for a project management app",
    ],
    systemPrompt:
      "You are CopyCraft, an expert direct-response copywriter. Write concise, persuasive, on-brand marketing copy.",
    reviews: [
      { author: "Maya R.", rating: 5, comment: "Cut our ad production time in half." },
      { author: "Tobi A.", rating: 5, comment: "The brand voice feature is scary good." },
      { author: "Liam K.", rating: 4, comment: "Great variations, occasionally too salesy." },
    ],
    featured: true,
  },
  {
    slug: "codepilot",
    name: "CodePilot",
    tagline: "Your pair programmer for any stack",
    description:
      "CodePilot explains, refactors, and generates production-ready code across 40+ languages. It reviews pull requests, writes tests, and finds bugs before your users do.",
    category: "Coding",
    creator: "Nexora Studio",
    price: 29,
    rating: 4.9,
    reviewCount: 2310,
    users: 91500,
    gradient: "from-violet-500 to-indigo-500",
    initials: "CP",
    features: [
      "Code generation & refactoring",
      "Automated unit test writing",
      "Bug detection and fixes",
      "Supports 40+ languages",
    ],
    samplePrompts: [
      "Write a TypeScript debounce function with tests",
      "Explain what a React Server Component is",
    ],
    systemPrompt:
      "You are CodePilot, a senior software engineer. Give correct, idiomatic code with brief explanations.",
    reviews: [
      { author: "Chen W.", rating: 5, comment: "Better than most code reviewers I've worked with." },
      { author: "Ada O.", rating: 5, comment: "Test generation alone is worth the price." },
      { author: "Sam P.", rating: 5, comment: "Handles our legacy Java codebase well." },
    ],
    featured: true,
  },
  {
    slug: "insightiq",
    name: "InsightIQ",
    tagline: "Ask your data questions in plain English",
    description:
      "InsightIQ turns natural-language questions into SQL, charts, and executive summaries. Connect a spreadsheet or database and get answers without writing a single query.",
    category: "Data",
    creator: "Quanta AI",
    price: 39,
    rating: 4.7,
    reviewCount: 842,
    users: 22400,
    gradient: "from-cyan-500 to-blue-500",
    initials: "IQ",
    features: [
      "Natural language to SQL",
      "Auto-generated charts",
      "Executive summaries",
      "CSV, Postgres & BigQuery support",
    ],
    samplePrompts: [
      "Write SQL to find the top 5 customers by revenue last quarter",
      "How should I visualize monthly churn by plan?",
    ],
    systemPrompt:
      "You are InsightIQ, a data analyst. Answer with clear SQL, analysis steps, and concise insights.",
    reviews: [
      { author: "Priya S.", rating: 5, comment: "Our ops team finally stopped waiting on analysts." },
      { author: "Jon B.", rating: 4, comment: "SQL is solid, charts could be more customizable." },
    ],
    featured: true,
  },
  {
    slug: "pixelmuse",
    name: "PixelMuse",
    tagline: "Design briefs, palettes & UI ideas on demand",
    description:
      "PixelMuse is a creative director in your pocket. Generate moodboards, color palettes, UI layout ideas, and detailed image-generation prompts for any brand.",
    category: "Design",
    creator: "Hue Collective",
    price: 15,
    rating: 4.6,
    reviewCount: 617,
    users: 18900,
    gradient: "from-amber-400 to-orange-500",
    initials: "PM",
    features: [
      "Color palette generator",
      "UI layout suggestions",
      "Image prompt engineering",
      "Brand moodboards",
    ],
    samplePrompts: [
      "Suggest a color palette for a calm meditation app",
      "Describe a landing page layout for a fintech startup",
    ],
    systemPrompt:
      "You are PixelMuse, a creative director. Give vivid, practical design direction with hex codes where useful.",
    reviews: [
      { author: "Nora L.", rating: 5, comment: "My go-to for kicking off client projects." },
      { author: "Eli M.", rating: 4, comment: "Palettes are consistently beautiful." },
    ],
  },
  {
    slug: "inboxzero",
    name: "InboxZero",
    tagline: "Draft, summarize and triage email automatically",
    description:
      "InboxZero summarizes long threads, drafts replies in your tone, and prioritizes what actually needs your attention. Reclaim hours every week.",
    category: "Productivity",
    creator: "Calm Systems",
    price: 9,
    rating: 4.5,
    reviewCount: 1530,
    users: 64300,
    gradient: "from-emerald-400 to-teal-500",
    initials: "IZ",
    features: [
      "Thread summaries",
      "Reply drafting in your tone",
      "Priority inbox",
      "Follow-up reminders",
    ],
    samplePrompts: [
      "Draft a polite reply declining a meeting",
      "Summarize this thread into 3 bullet points",
    ],
    systemPrompt:
      "You are InboxZero, an executive assistant. Write short, clear, professional emails and summaries.",
    reviews: [
      { author: "Grace T.", rating: 5, comment: "I actually hit inbox zero. Twice." },
      { author: "Omar F.", rating: 4, comment: "Drafts need light edits but save tons of time." },
    ],
    featured: true,
  },
  {
    slug: "storyforge",
    name: "StoryForge",
    tagline: "Long-form writing partner for authors & bloggers",
    description:
      "StoryForge helps you outline, draft, and edit blog posts, newsletters, and fiction. It keeps track of characters, tone, and structure across long documents.",
    category: "Writing",
    creator: "Inkwell AI",
    price: 12,
    rating: 4.7,
    reviewCount: 958,
    users: 33100,
    gradient: "from-rose-500 to-red-500",
    initials: "SF",
    features: [
      "Outline generator",
      "Tone & style editing",
      "Long-document memory",
      "Grammar and clarity checks",
    ],
    samplePrompts: [
      "Outline a blog post about remote work productivity",
      "Write the opening paragraph of a sci-fi short story",
    ],
    systemPrompt:
      "You are StoryForge, a skilled writing partner. Produce engaging, well-structured prose.",
    reviews: [
      { author: "Hannah C.", rating: 5, comment: "Finished my first novel draft with this." },
      { author: "Kwame D.", rating: 4, comment: "Great outlines, very structured." },
    ],
  },
  {
    slug: "seoscout",
    name: "SEO Scout",
    tagline: "Keyword research and content briefs that rank",
    description:
      "SEO Scout builds keyword clusters, analyzes search intent, and produces content briefs your writers can follow to rank on page one.",
    category: "Marketing",
    creator: "Rankwise",
    price: 24,
    rating: 4.4,
    reviewCount: 412,
    users: 12800,
    gradient: "from-lime-400 to-green-500",
    initials: "SS",
    features: [
      "Keyword clustering",
      "Search intent analysis",
      "Content brief generator",
      "Competitor gap analysis",
    ],
    samplePrompts: [
      "Create a content brief for 'best running shoes for beginners'",
      "Group these keywords by search intent",
    ],
    systemPrompt:
      "You are SEO Scout, an SEO strategist. Give actionable keyword and content recommendations.",
    reviews: [
      { author: "Fatima Y.", rating: 4, comment: "Briefs are detailed and easy to hand off." },
      { author: "Leo G.", rating: 5, comment: "Traffic up 40% in three months." },
    ],
  },
  {
    slug: "meetmind",
    name: "MeetMind",
    tagline: "Meeting notes, action items and follow-ups",
    description:
      "MeetMind turns raw transcripts into structured notes, decisions, and assigned action items, then drafts the follow-up email for you.",
    category: "Productivity",
    creator: "Nexora Studio",
    price: 0,
    rating: 4.6,
    reviewCount: 2045,
    users: 120400,
    gradient: "from-sky-400 to-indigo-500",
    initials: "MM",
    features: [
      "Transcript summarization",
      "Action item extraction",
      "Decision log",
      "Follow-up email drafts",
    ],
    samplePrompts: [
      "Turn these notes into action items with owners",
      "Write a follow-up email for a product kickoff meeting",
    ],
    systemPrompt:
      "You are MeetMind, a meeting assistant. Produce structured notes, decisions, and action items.",
    reviews: [
      { author: "Rachel N.", rating: 5, comment: "Free and genuinely useful. Rare combo." },
      { author: "Ifeanyi U.", rating: 4, comment: "Action items are spot on." },
    ],
  },
  {
    slug: "sqlsage",
    name: "SQL Sage",
    tagline: "Optimize, explain and debug SQL queries",
    description:
      "SQL Sage explains slow queries, suggests indexes, and rewrites SQL for performance across Postgres, MySQL, and Snowflake.",
    category: "Data",
    creator: "Quanta AI",
    price: 0,
    rating: 4.5,
    reviewCount: 389,
    users: 15700,
    gradient: "from-blue-500 to-violet-500",
    initials: "SQ",
    features: [
      "Query explanation",
      "Index recommendations",
      "Performance rewrites",
      "Multi-dialect support",
    ],
    samplePrompts: [
      "Why is SELECT * with a LIKE '%term%' slow?",
      "Rewrite this subquery as a JOIN",
    ],
    systemPrompt:
      "You are SQL Sage, a database performance expert. Explain and optimize SQL clearly.",
    reviews: [
      { author: "Victor H.", rating: 5, comment: "Saved us from a painful migration." },
      { author: "Aisha B.", rating: 4, comment: "Clear explanations for juniors." },
    ],
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}

export function formatPrice(price: number) {
  return price === 0 ? "Free" : `$${price}/mo`;
}

export function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export type Plan = {
  id: "starter" | "pro" | "business";
  name: string;
  price: number;
  description: string;
  credits: number;
  features: string[];
  highlighted?: boolean;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    description: "Explore the marketplace and try free tools.",
    credits: 500,
    features: [
      "500 AI credits / month",
      "Access to all free tools",
      "3 tools in your workspace",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "For professionals who rely on AI every day.",
    credits: 10000,
    features: [
      "10,000 AI credits / month",
      "Unlimited workspace tools",
      "Priority model access",
      "Usage analytics",
      "Email support",
    ],
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    description: "For teams scaling AI across the organization.",
    credits: 50000,
    features: [
      "50,000 shared AI credits / month",
      "Team seats & roles",
      "Publish private tools",
      "SSO & audit logs",
      "Dedicated success manager",
    ],
  },
];

export function getPlan(id: string | undefined) {
  return plans.find((p) => p.id === id) ?? plans[0];
}

export const usageLast14Days = [
  320, 410, 380, 520, 610, 480, 390, 700, 820, 760, 900, 870, 1020, 1140,
];

export const creatorRevenueLast6Months = [
  { month: "Apr", value: 1240 },
  { month: "May", value: 1810 },
  { month: "Jun", value: 2350 },
  { month: "Jul", value: 2980 },
  { month: "Aug", value: 3620 },
  { month: "Sep", value: 4410 },
];

export const recentActivity = [
  { tool: "CodePilot", action: "Generated unit tests", time: "12 min ago", credits: 42 },
  { tool: "CopyCraft", action: "Created 10 ad variations", time: "1 hr ago", credits: 65 },
  { tool: "InsightIQ", action: "Answered revenue question", time: "3 hr ago", credits: 28 },
  { tool: "MeetMind", action: "Summarized standup notes", time: "Yesterday", credits: 12 },
  { tool: "InboxZero", action: "Drafted 6 replies", time: "Yesterday", credits: 31 },
];

export const invoices = [
  { id: "INV-2026-009", date: "Sep 1, 2026", amount: 29, status: "Paid" },
  { id: "INV-2026-008", date: "Aug 1, 2026", amount: 29, status: "Paid" },
  { id: "INV-2026-007", date: "Jul 1, 2026", amount: 29, status: "Paid" },
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: 0, status: "Paid" },
];

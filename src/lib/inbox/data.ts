export type InboxChannel = "email" | "chat" | "sms" | "whatsapp";

export type InboxMessage = {
  id: string;
  from: "customer" | "agent" | "ai";
  author: string;
  body: string;
  at: number;
};

export type InboxCustomer = {
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  plan: string;
  mrr: number;
  customerSince: number | null;
  tags: string[];
};

export type InboxSummary = {
  text: string;
  intent: string;
  sentiment: "positive" | "neutral" | "negative";
  points: string[];
  /** Reply drafts; `{agent}` is replaced with the signed-in user's first name. */
  suggestions: string[];
};

export type InboxConversation = {
  id: string;
  customer: InboxCustomer;
  channel: InboxChannel;
  subject: string;
  assigneeId: string | null;
  aiHandled: boolean;
  unread: number;
  status: "open" | "resolved";
  messages: InboxMessage[];
  summary: InboxSummary;
};

export type InboxState = { version: number; seededAt: number; conversations: InboxConversation[] };

export const INBOX_VERSION = 1;

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const channelLabel: Record<InboxChannel, string> = { email: "Email", chat: "Live chat", sms: "SMS", whatsapp: "WhatsApp" };

type SeedMessage = [from: InboxMessage["from"], ago: number, body: string];

type SeedConversation = Omit<InboxConversation, "messages" | "customer"> & {
  customer: Omit<InboxCustomer, "customerSince"> & { sinceDays: number | null };
  messages: SeedMessage[];
  agent?: string;
};

const seeds: SeedConversation[] = [
  {
    id: "cv_sarah",
    customer: {
      name: "Sarah Williams",
      company: "Acme Corp",
      title: "Head of Operations",
      email: "sarah.williams@acmecorp.com",
      phone: "+1 (512) 555-0187",
      location: "Austin, TX",
      plan: "Growth · 26 seats",
      mrr: 2054,
      sinceDays: 243,
      tags: ["Upgrade opportunity", "Champion"],
    },
    channel: "email",
    subject: "Upgrading to the Scale plan",
    assigneeId: "james",
    aiHandled: false,
    unread: 1,
    status: "open",
    agent: "James Carter",
    messages: [
      ["customer", 2 * DAY, "Hi team,\n\nWe've been on the Growth plan for about eight months and it's working really well for sales. We're adding 14 people to our support team in October and would like them on Nexora too.\n\nCould you tell me what the upgrade would look like?\n\nThanks,\nSarah"],
      ["agent", 2 * DAY - 3 * HOUR, "Hi Sarah,\n\nGreat to hear! For a team of 40 the Scale plan is the best fit. It adds shared inboxes, SSO and 10,000 AI credits a month. I've attached the plan comparison.\n\nBest,\nJames"],
      ["customer", 2 * MIN, "Thanks James, this looks great and we'd like to go ahead. Before I take it to finance I need a few pricing details:\n\n1. Is the $79 per seat billed monthly or annually?\n2. Do unused AI credits roll over?\n3. Would we get the multi-year discount if we commit for two years?\n\nSarah"],
    ],
    summary: {
      text: "Customer is interested in upgrading but requested pricing clarification.",
      intent: "Upgrade",
      sentiment: "positive",
      points: [
        "Wants to move from 26 to 40 seats on the Scale plan",
        "Asked whether $79 per seat is billed monthly or annually",
        "Asked if unused AI credits roll over",
        "Open to a two-year commitment for a discount",
      ],
      suggestions: [
        "Hi Sarah,\n\nHappy to clarify before you speak with finance:\n\n1. Scale is $79 per seat per month when billed annually, or $95 month to month.\n2. Unused AI credits roll over for one billing cycle.\n3. Yes. A two-year commitment qualifies for our 15% multi-year discount, bringing it to $67 per seat.\n\nFor 40 seats on a two-year plan that's $2,680 a month. I can send a formal quote today so finance has exact numbers. Would that help?\n\nBest,\n{agent}",
        "Hi Sarah,\n\nGreat questions. Short answers: $79 per seat is the annual rate ($95 monthly), AI credits roll over for one cycle, and a two-year term gets 15% off.\n\nI'll put together a quote for 40 seats so you can share it with finance. Anything else they'll want to see?\n\nThanks,\n{agent}",
      ],
    },
  },
  {
    id: "cv_michael",
    customer: {
      name: "Michael Brown",
      company: "Nova Labs",
      title: "CTO",
      email: "michael@novalabs.io",
      phone: "+1 (415) 555-0123",
      location: "San Francisco, CA",
      plan: "Trial · day 9 of 14",
      mrr: 0,
      sinceDays: null,
      tags: ["Trial", "Technical buyer"],
    },
    channel: "chat",
    subject: "API and data processing agreement",
    assigneeId: null,
    aiHandled: true,
    unread: 2,
    status: "open",
    messages: [
      ["customer", 23 * MIN, "Hi, does Nexora have an API for syncing leads from our own product?"],
      ["ai", 23 * MIN - 20_000, "Hi Michael! Yes. The REST API and webhooks let you create and update leads in real time. The guide is at docs.nexora.ai/api. Would you like the rate limits too?"],
      ["customer", 17 * MIN, "Yes please. We'd push about 50k events a day. We'd also need a custom DPA signed."],
      ["ai", 17 * MIN - 25_000, "The API allows 100 requests per second, so 50,000 events a day is well within limits. For a custom DPA I'll bring in someone from our team."],
      ["customer", 14 * MIN, "Great, thanks. Who should I talk to about the DPA?"],
    ],
    summary: {
      text: "Technical buyer evaluating the API for high-volume lead sync. The AI answered the rate-limit questions, but a custom DPA needs a person.",
      intent: "Technical evaluation",
      sentiment: "positive",
      points: ["Needs to sync about 50,000 lead events a day", "AI confirmed the API rate limit is sufficient", "Requires a custom data processing agreement", "Trial ends in 5 days"],
      suggestions: [
        "Hi Michael, {agent} here from the Nexora team. Thanks for waiting!\n\nI can help with the DPA. We have a standard DPA I can send right away, and our legal team reviews custom terms within 3 business days. Would you like to send over your template, or start from ours?",
        "Hi Michael, I'm {agent} and I'll look after the DPA for you. Easiest path: I'll email our standard DPA now and loop in legal if you need changes. What's the best email for your legal contact?",
      ],
    },
  },
  {
    id: "cv_emily",
    customer: {
      name: "Emily Carter",
      company: "Brightside Dental",
      title: "Practice Manager",
      email: "emily@brightsidedental.com",
      phone: "+1 (617) 555-0164",
      location: "Boston, MA",
      plan: "Starter · 5 seats",
      mrr: 245,
      sinceDays: 410,
      tags: ["Customer"],
    },
    channel: "sms",
    subject: "Rescheduling onboarding call",
    assigneeId: null,
    aiHandled: true,
    unread: 0,
    status: "resolved",
    messages: [
      ["customer", 48 * MIN, "Hi, can we move tomorrow's training call to Thursday? Something came up."],
      ["ai", 48 * MIN - 15_000, "No problem, Emily! I have Thursday at 10:00 AM or 2:30 PM. Which works better?"],
      ["customer", 44 * MIN, "2:30 please"],
      ["ai", 43 * MIN, "Done. You're booked for Thursday at 2:30 PM. A calendar invite is on its way."],
      ["customer", 42 * MIN, "Perfect, thank you!"],
    ],
    summary: {
      text: "Customer asked to reschedule a training call. The AI moved it to Thursday at 2:30 PM and the customer confirmed.",
      intent: "Scheduling",
      sentiment: "positive",
      points: ["Training call moved to Thursday, 2:30 PM", "Calendar invite sent automatically", "No follow-up needed"],
      suggestions: ["Hi Emily, just confirming you're all set for Thursday at 2:30 PM. See you then! {agent}"],
    },
  },
  {
    id: "cv_daniel",
    customer: {
      name: "Daniel Kim",
      company: "Vertex Media",
      title: "Marketing Operations Lead",
      email: "daniel.kim@vertexmedia.com",
      phone: "+1 (646) 555-0110",
      location: "New York, NY",
      plan: "Growth · 12 seats",
      mrr: 948,
      sinceDays: 21,
      tags: ["Onboarding"],
    },
    channel: "email",
    subject: "CSV import keeps failing",
    assigneeId: "maya",
    aiHandled: false,
    unread: 1,
    status: "open",
    messages: [
      ["customer", 70 * MIN, "Hi,\n\nI'm trying to import 3,200 contacts from a CSV but it stops at row 1,184 with “Invalid date”. The file came straight out of our old CRM. Any idea what's wrong?\n\nDaniel"],
    ],
    summary: {
      text: "New customer's contact import fails on a date format. Likely a DD/MM date in the created-at column.",
      intent: "Support",
      sentiment: "neutral",
      points: ["Importing 3,200 contacts during onboarding", "Import stops at row 1,184 with “Invalid date”", "File exported from a previous CRM"],
      suggestions: [
        "Hi Daniel,\n\nThanks for flagging this. “Invalid date” usually means a row uses a different date format, often DD/MM/YYYY instead of MM/DD/YYYY. If you check the created date on row 1,184 you'll likely spot it.\n\nOn the import screen you can set the date format to “Detect automatically”, or send me the file and I'll run the import for you.\n\nBest,\n{agent}",
      ],
    },
  },
  {
    id: "cv_olivia",
    customer: {
      name: "Olivia Martinez",
      company: "Harbor & Co",
      title: "Founder",
      email: "olivia@harborandco.com",
      phone: "+34 612 555 019",
      location: "Barcelona, ES",
      plan: "Growth · 8 seats",
      mrr: 632,
      sinceDays: 152,
      tags: ["Billing"],
    },
    channel: "whatsapp",
    subject: "Invoice with VAT number",
    assigneeId: "james",
    aiHandled: false,
    unread: 0,
    status: "open",
    agent: "James Carter",
    messages: [
      ["customer", 3 * HOUR + 20 * MIN, "Hola! Could you resend September's invoice with our VAT number? ESB12345678"],
      ["agent", 3 * HOUR, "Hi Olivia, of course. I've added the VAT number to your account and I'll send the updated invoice shortly."],
      ["customer", 2 * HOUR + 50 * MIN, "Gracias!"],
    ],
    summary: {
      text: "Customer needs September's invoice reissued with their VAT number. The number is on file; the invoice still needs sending.",
      intent: "Billing",
      sentiment: "positive",
      points: ["VAT number ESB12345678 added to the account", "Updated September invoice not sent yet"],
      suggestions: ["Hi Olivia, here's the updated September invoice with your VAT number. Future invoices will include it automatically. {agent}"],
    },
  },
  {
    id: "cv_ryan",
    customer: {
      name: "Ryan Cooper",
      company: "Orbit Systems",
      title: "Security Lead",
      email: "ryan.cooper@orbitsystems.com",
      phone: "+1 (415) 555-0199",
      location: "San Francisco, CA",
      plan: "Prospect · $48k deal",
      mrr: 0,
      sinceDays: null,
      tags: ["Enterprise", "Security review"],
    },
    channel: "email",
    subject: "Security questionnaire",
    assigneeId: "james",
    aiHandled: false,
    unread: 0,
    status: "open",
    messages: [
      ["customer", DAY + 2 * HOUR, "Hi,\n\nAttached is our vendor security questionnaire (84 questions). We'd need it back by Friday to stay on track for the pilot. Can you also share your latest SOC 2 Type II report?\n\nRyan"],
    ],
    summary: {
      text: "Enterprise prospect needs an 84-question security questionnaire and the SOC 2 report by Friday to keep the pilot on schedule.",
      intent: "Security review",
      sentiment: "neutral",
      points: ["84-question questionnaire due Friday", "Requested the SOC 2 Type II report", "Blocks a $48k pilot"],
      suggestions: [
        "Hi Ryan,\n\nThanks for sending this over. Our security team will return the completed questionnaire by Thursday. I've attached our SOC 2 Type II report under NDA along with our pen-test summary.\n\nIf a call with our security lead would speed things up, I'm happy to set one up.\n\nBest,\n{agent}",
      ],
    },
  },
  {
    id: "cv_priya",
    customer: {
      name: "Priya Shah",
      company: "Lumen Studio",
      title: "Studio Director",
      email: "priya@lumenstudio.co",
      phone: "+1 (416) 555-0148",
      location: "Toronto, CA",
      plan: "Lead · Website chat",
      mrr: 0,
      sinceDays: null,
      tags: ["New lead", "Demo booked"],
    },
    channel: "chat",
    subject: "Demo request",
    assigneeId: null,
    aiHandled: true,
    unread: 0,
    status: "open",
    messages: [
      ["customer", 5 * HOUR, "Hi! We're a 15-person design studio. Can Nexora handle client intake forms and follow-ups?"],
      ["ai", 5 * HOUR - 12_000, "Hi Priya! Yes. Intake forms create leads automatically and follow-up emails go out on a schedule you choose. Would a 20-minute demo help?"],
      ["customer", 4 * HOUR + 50 * MIN, "Yes, tomorrow afternoon if possible"],
      ["ai", 4 * HOUR + 49 * MIN, "You're booked for tomorrow at 3:00 PM with Liam from our team. You'll get a calendar invite shortly."],
    ],
    summary: {
      text: "Design studio lead asked about intake forms and follow-ups. The AI qualified the lead and booked a demo for tomorrow at 3:00 PM.",
      intent: "Demo request",
      sentiment: "positive",
      points: ["15-person design studio", "Interested in intake forms and automated follow-ups", "Demo booked for tomorrow, 3:00 PM"],
      suggestions: ["Hi Priya, {agent} here. Looking forward to tomorrow's demo! If you share a sample intake form beforehand, I'll set it up so you can see it live."],
    },
  },
  {
    id: "cv_lucas",
    customer: {
      name: "Lucas Meyer",
      company: "Stackfield",
      title: "VP Revenue",
      email: "lucas.meyer@stackfield.com",
      phone: "+49 30 555 0142",
      location: "Berlin, DE",
      plan: "Scale · 60 seats",
      mrr: 5700,
      sinceDays: 380,
      tags: ["Customer", "Feature request"],
    },
    channel: "email",
    subject: "Outlook calendar support",
    assigneeId: "daniel",
    aiHandled: false,
    unread: 0,
    status: "resolved",
    agent: "Daniel Okafor",
    messages: [
      ["customer", 2 * DAY + 4 * HOUR, "Hi Daniel, half our team books meetings in Outlook. Any plans to support it for booking links?"],
      ["agent", 2 * DAY + HOUR, "Hi Lucas, good news: Outlook Calendar is now available in Integrations. Connect it from the marketplace and booking links will use Outlook availability."],
      ["customer", 2 * DAY, "Just connected it. Works perfectly, thanks!"],
    ],
    summary: {
      text: "Customer asked for Outlook calendar support. It's now available and the customer has connected it.",
      intent: "Feature request",
      sentiment: "positive",
      points: ["Outlook Calendar connected", "No follow-up needed"],
      suggestions: ["Glad to hear it, Lucas! Let me know if anything looks off with availability. {agent}"],
    },
  },
  {
    id: "cv_grace",
    customer: {
      name: "Grace Lee",
      company: "Cedar Dental",
      title: "Operations Director",
      email: "grace.lee@cedardental.com",
      phone: "+1 (206) 555-0172",
      location: "Seattle, WA",
      plan: "Lead · 3 locations",
      mrr: 0,
      sinceDays: null,
      tags: ["Multi-location"],
    },
    channel: "sms",
    subject: "Pricing for three locations",
    assigneeId: "sofia",
    aiHandled: true,
    unread: 0,
    status: "open",
    messages: [
      ["customer", 3 * DAY, "Do you offer pricing for dental groups with multiple locations?"],
      ["ai", 3 * DAY - 10_000, "We do! Groups with 3 or more locations get shared reporting and volume pricing. Sofia from our team will send details today."],
      ["agent", 3 * DAY - 2 * HOUR, "Hi Grace, Sofia here. I've emailed our multi-location pricing. Happy to walk through it on a call this week."],
    ],
    summary: {
      text: "Three-location dental group asked about volume pricing. Pricing was sent; waiting on the customer to book a call.",
      intent: "Pricing",
      sentiment: "neutral",
      points: ["Three practice locations", "Multi-location pricing emailed", "Call not booked yet"],
      suggestions: ["Hi Grace, just checking you received the multi-location pricing. Would Thursday or Friday suit a quick 15-minute call? {agent}"],
    },
  },
];

export function createInbox(now = Date.now()): InboxState {
  return {
    version: INBOX_VERSION,
    seededAt: now,
    conversations: seeds.map(({ customer, messages, agent, ...rest }) => {
      const { sinceDays, ...details } = customer;
      return {
        ...rest,
        customer: { ...details, customerSince: sinceDays === null ? null : now - sinceDays * DAY },
        messages: messages.map(([from, ago, body], i) => ({
          id: `${rest.id}_m${i}`,
          from,
          author: from === "customer" ? customer.name : from === "ai" ? "Nexora AI" : (agent ?? "Sofia Alvarez"),
          body,
          at: now - ago,
        })),
      };
    }),
  };
}

export const lastMessage = (c: InboxConversation) => c.messages[c.messages.length - 1];

export const lastActivity = (c: InboxConversation) => lastMessage(c)?.at ?? 0;

export const awaitingReply = (c: InboxConversation) => c.status === "open" && lastMessage(c)?.from === "customer";

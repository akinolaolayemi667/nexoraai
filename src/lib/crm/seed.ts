import type {
  Activity,
  ActivityType,
  CrmState,
  Deal,
  DealStage,
  Lead,
  LeadSource,
  LeadStatus,
  Message,
  Note,
  Task,
  Thread,
} from "./types";
import { ownerById, sourceLabel, statusMeta } from "./constants";

export const CRM_VERSION = 1;

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value: string) {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

const pick = <T,>(rng: () => number, items: readonly T[]) => items[Math.floor(rng() * items.length)];

function weighted<T extends string>(rng: () => number, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  let roll = rng() * entries.reduce((sum, [, w]) => sum + w, 0);
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[0][0];
}

export function domainFor(company: string) {
  return `${company.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]/g, "")}.com`;
}

export function emailFor(name: string, company: string) {
  const [first, ...rest] = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/\s+/);
  return `${first}.${rest.join("") || "team"}@${domainFor(company)}`;
}

function phoneFor(rng: () => number) {
  const area = pick(rng, ["212", "312", "415", "512", "617", "646", "720", "206"]);
  return `+1 (${area}) 555-${String(Math.floor(rng() * 9000) + 1000)}`;
}

/* Hand-written leads ------------------------------------------------------ */

type SeedLead = [
  name: string,
  title: string,
  company: string,
  source: LeadSource,
  status: LeadStatus,
  score: number,
  ownerId: string,
  lastActivity: string,
  ago: number,
  location: string,
];

const featuredLeads: SeedLead[] = [
  ["Sarah Kim", "VP Operations", "Acme Corp", "organic", "qualified", 92, "james", "Viewed proposal", 12 * MIN, "Austin, TX"],
  ["Marcus Reid", "COO", "Brightline Logistics", "referral", "qualified", 87, "maya", "Replied to email", 38 * MIN, "Chicago, IL"],
  ["Elena Petrova", "Marketing Director", "Vertex Media", "paid", "contacted", 74, "daniel", "Booked a demo", 80 * MIN, "New York, NY"],
  ["Tomás Rivera", "Founder", "Harbor & Co", "events", "nurturing", 61, "sofia", "Downloaded pricing guide", 130 * MIN, "Miami, FL"],
  ["Grace Liu", "Studio Manager", "Lumen Studio", "social", "new", 43, "liam", "Submitted contact form", 3 * HOUR, "Toronto, CA"],
  ["Priya Raman", "Director of Patient Experience", "Northwind Health", "organic", "contacted", 68, "sofia", "Requested a demo", 8 * DAY + 3 * HOUR, "Seattle, WA"],
  ["Owen Hart", "Head of Support", "Kestrel Labs", "referral", "qualified", 71, "maya", "Completed discovery call", DAY, "Denver, CO"],
  ["Hannah Moore", "VP Digital", "Aurora Retail", "paid", "qualified", 79, "daniel", "Completed discovery call", 9 * DAY, "London, UK"],
  ["David Chen", "Chief Compliance Officer", "Pinecrest Finance", "organic", "qualified", 66, "maya", "Shared requirements doc", 8 * DAY + 6 * HOUR, "Boston, MA"],
  ["Nora Ellis", "Head of Research", "Fieldnote", "social", "qualified", 58, "liam", "Booked a demo", 5 * HOUR, "Dublin, IE"],
  ["Ben Foster", "Content Lead", "Quillstone", "events", "qualified", 77, "sofia", "Viewed proposal", 2 * DAY, "Bristol, UK"],
  ["Aisha Bello", "Operations Director", "Cobalt Health", "referral", "qualified", 83, "james", "Viewed proposal", DAY + 2 * HOUR, "Lagos, NG"],
  ["Ryan Brooks", "CIO", "Orbit Systems", "organic", "qualified", 89, "james", "Requested security review", 4 * HOUR, "San Francisco, CA"],
  ["Kenji Watanabe", "VP Revenue", "Stackfield", "referral", "won", 95, "james", "Signed contract", 3 * DAY, "Singapore"],
  ["Laura Bennett", "COO", "Meridian Co", "organic", "won", 90, "daniel", "Completed onboarding call", 11 * DAY, "Amsterdam, NL"],
  ["Chris Park", "Owner", "Lumos", "social", "won", 88, "maya", "Paid first invoice", 19 * DAY, "Sydney, AU"],
  ["Mia Torres", "General Manager", "Driftwood", "paid", "lost", 35, "liam", "Chose another vendor", 6 * DAY, "Lisbon, PT"],
  ["Alex Novak", "Product Manager", "Nimbus", "events", "lost", 29, "sofia", "No response after 3 follow-ups", 14 * DAY, "Prague, CZ"],
];

/* Generated leads --------------------------------------------------------- */

const firstNames = [
  "Adaeze", "Chinedu", "Fatima", "Hiroshi", "Ingrid", "Javier", "Kwame", "Leila", "Mateo", "Nadia",
  "Oscar", "Paula", "Rahul", "Selin", "Tariq", "Uma", "Victor", "Wen", "Yara", "Zoe",
  "Amara", "Bruno", "Camila", "Dmitri", "Esther", "Felix", "Gabriela", "Hugo", "Iris", "Jonah",
  "Keira", "Luca", "Maren", "Nico", "Omar", "Pia", "Quinn", "Rosa", "Sami", "Theo",
];

const lastNames = [
  "Adeyemi", "Bauer", "Castillo", "Dubois", "Eriksen", "Fischer", "Garcia", "Haddad", "Ibrahim", "Jensen",
  "Kowalski", "Lindqvist", "Mensah", "Nakamura", "Olsen", "Patel", "Quintero", "Rossi", "Schmidt", "Tanaka",
  "Usman", "Varga", "Weber", "Xu", "Yilmaz", "Zhang", "Abbott", "Brennan", "Costa", "Delgado",
  "Evans", "Farah", "Grant", "Hughes", "Iyer", "Jovanovic", "Kaur", "Larsen", "Moreau", "Nwosu",
];

const companies = [
  "Acorn Analytics", "Bluebird Travel", "Cedar Dental", "Delta Freight", "Ember Foods", "Fable Books",
  "Granite Legal", "Helix Bio", "Indigo Apparel", "Juniper Clinics", "Keystone Realty", "Larkspur Events",
  "Mosaic Labs", "Nova Robotics", "Oakline Logistics", "Parcel Pro", "Quartz Security", "Redwood Capital",
  "Summit Fitness", "Tidewater Marine", "Umbra Design", "Vantage HR", "Willow Home", "Xenon Energy",
  "Yellowfin Media", "Zephyr Air", "Atlas Tutoring", "Beacon Insurance", "Crescent Hotels", "Evergreen Solar",
  "Foundry Coffee", "Glasshouse Studio", "Harborview Health", "Ironclad Tools", "Jetstream Courier",
  "Lighthouse Schools", "Maple & Main", "Northstar Cloud", "Orchard Pharmacy", "Pioneer Ag", "Riverbend Clinics",
  "Silverline Auto", "Terrace Architects", "Upland Outdoors", "Velvet Salon", "Wavelength Audio",
  "Yardstick Consulting", "Zenith Payroll",
];

const titles = [
  "CEO", "Founder", "Head of Sales", "Operations Manager", "Marketing Director", "VP Revenue",
  "Office Manager", "Customer Success Lead", "CTO", "Sales Manager", "Growth Lead", "Managing Partner",
];

const locations = [
  "Lagos, NG", "London, UK", "Austin, TX", "Toronto, CA", "Berlin, DE", "Nairobi, KE",
  "New York, NY", "Dublin, IE", "Sydney, AU", "Amsterdam, NL", "Chicago, IL", "Cape Town, ZA",
];

export const activityByStatus: Record<LeadStatus, string[]> = {
  new: ["Submitted contact form", "Signed up for newsletter", "Downloaded pricing guide", "Requested a demo"],
  contacted: ["Sent intro email", "Left voicemail", "Opened follow-up email", "Replied to email"],
  qualified: ["Completed discovery call", "Booked a demo", "Viewed proposal", "Shared requirements doc"],
  nurturing: ["Opened newsletter", "Attended webinar", "Visited pricing page", "Read case study"],
  won: ["Signed contract", "Completed onboarding call", "Paid first invoice"],
  lost: ["Chose another vendor", "Marked lost: no budget", "No response after 3 follow-ups"],
};

const scoreRange: Record<LeadStatus, [number, number]> = {
  new: [18, 82],
  contacted: [40, 86],
  qualified: [62, 96],
  nurturing: [32, 72],
  won: [78, 98],
  lost: [8, 46],
};

const ownerIds = ["james", "maya", "daniel", "sofia", "liam"];

function buildLeads(now: number): Lead[] {
  const leads: Lead[] = featuredLeads.map(
    ([name, title, company, source, status, score, ownerId, lastActivity, ago, location], index) => {
      const rng = mulberry32(hashString(name));
      const lastActivityAt = now - ago;
      return {
        id: `ld_${String(index + 1).padStart(3, "0")}`,
        name,
        title,
        company,
        email: emailFor(name, company),
        phone: phoneFor(rng),
        location,
        website: domainFor(company),
        source,
        status,
        score,
        ownerId,
        lastActivity,
        lastActivityAt,
        createdAt: lastActivityAt - (8 + Math.floor(rng() * 40)) * DAY,
      };
    },
  );

  const rng = mulberry32(2026);
  const usedNames = new Set(leads.map((l) => l.name));
  while (leads.length < 248) {
    const name = `${pick(rng, firstNames)} ${pick(rng, lastNames)}`;
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    const company = pick(rng, companies);
    const status = weighted<LeadStatus>(rng, { new: 30, contacted: 22, qualified: 18, nurturing: 15, won: 8, lost: 7 });
    const [min, max] = scoreRange[status];
    const lastActivityAt = now - Math.round(5 * HOUR + Math.pow(rng(), 1.6) * 45 * DAY);
    leads.push({
      id: `ld_${String(leads.length + 1).padStart(3, "0")}`,
      name,
      title: pick(rng, titles),
      company,
      email: emailFor(name, company),
      phone: phoneFor(rng),
      location: pick(rng, locations),
      website: domainFor(company),
      source: weighted<LeadSource>(rng, { organic: 38, referral: 22, paid: 18, social: 12, events: 10 }),
      status,
      score: Math.round(min + rng() * (max - min)),
      ownerId: pick(rng, ownerIds),
      lastActivity: pick(rng, activityByStatus[status]),
      lastActivityAt,
      createdAt: lastActivityAt - Math.round(DAY + rng() * 60 * DAY),
    });
  }
  return leads.map((lead) => ({ ...lead, seed: { activity: lead.lastActivity, at: lead.lastActivityAt, status: lead.status } }));
}

/* Deals ------------------------------------------------------------------- */

type SeedDeal = [
  company: string,
  name: string,
  value: number,
  probability: number,
  stage: DealStage,
  ownerId: string,
  contactIndex: number,
  ago: number,
  closeInDays: number,
];

const seedDeals: SeedDeal[] = [
  ["Northwind Health", "Patient intake automation", 9500, 30, "new", "sofia", 6, 8 * DAY + 3 * HOUR, 45],
  ["Lumen Studio", "Sales CRM rollout", 6000, 35, "new", "liam", 5, 3 * HOUR, 60],
  ["Harbor & Co", "Lead scoring setup", 14000, 55, "qualified", "sofia", 4, 130 * MIN, 38],
  ["Kestrel Labs", "Support inbox AI", 8500, 60, "qualified", "maya", 7, DAY, 30],
  ["Aurora Retail", "Omnichannel conversations", 22000, 65, "discovery", "daniel", 8, 9 * DAY, 28],
  ["Pinecrest Finance", "Compliance workflows", 18000, 70, "discovery", "maya", 9, 8 * DAY + 6 * HOUR, 34],
  ["Fieldnote", "Research repository sync", 13500, 40, "discovery", "liam", 10, 5 * HOUR, 40],
  ["Acme Corp", "Website Automation", 12500, 75, "proposal", "james", 1, 2 * HOUR, 14],
  ["Vertex Media", "Analytics workspace", 26000, 80, "proposal", "daniel", 3, 6 * HOUR, 18],
  ["Quillstone", "Content approvals", 6500, 71, "proposal", "sofia", 11, 2 * DAY, 21],
  ["Cobalt Health", "Referral intake bot", 20000, 74, "proposal", "james", 12, DAY + 2 * HOUR, 16],
  ["Brightline Logistics", "Fleet ops automation", 48000, 82, "negotiation", "maya", 2, 38 * MIN, 5],
  ["Orbit Systems", "Enterprise rollout", 44000, 85, "negotiation", "james", 13, 4 * HOUR, 9],
  ["Stackfield", "Revenue ops suite", 31000, 100, "won", "james", 14, 3 * DAY, -3],
  ["Meridian Co", "Customer onboarding flows", 21700, 100, "won", "daniel", 15, 11 * DAY, -11],
  ["Lumos", "AI receptionist", 11500, 100, "won", "maya", 16, 19 * DAY, -19],
  ["Driftwood", "Booking automation", 9000, 0, "lost", "liam", 17, 6 * DAY, -6],
  ["Nimbus", "Chat widget pilot", 7500, 0, "lost", "sofia", 18, 14 * DAY, -14],
];

export function isoDate(timestamp: number) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildDeals(now: number): Deal[] {
  return seedDeals.map(([company, name, value, probability, stage, ownerId, contactIndex, ago, closeInDays], i) => {
    const lastActivityAt = now - ago;
    const closed = stage === "won" || stage === "lost";
    return {
      id: `dl_${String(i + 1).padStart(2, "0")}`,
      name,
      company,
      contactId: `ld_${String(contactIndex).padStart(3, "0")}`,
      value,
      probability,
      stage,
      ownerId,
      expectedClose: isoDate(now + closeInDays * DAY),
      lastActivityAt,
      createdAt: lastActivityAt - (12 + i * 2) * DAY,
      closedAt: closed ? lastActivityAt : undefined,
    };
  });
}

/* Notes and tasks --------------------------------------------------------- */

function buildNotes(now: number): Note[] {
  const notes: [leadId: string, body: string, author: string, ago: number][] = [
    ["ld_001", "Wants inbound form routing by territory before Q4 hiring. Budget approved; decision expected by Oct 15.", "James Carter", DAY],
    ["ld_001", "Legal is reviewing our DPA. Send the SOC 2 report with the revised proposal.", "James Carter", 3 * DAY],
    ["ld_002", "Marcus is our champion. Current vendor renewal is Oct 31, so we need fleet dashboards live before then.", "Maya Chen", 2 * DAY],
    ["ld_003", "Interested in the analytics workspace for 12 seats. Asked about Looker export.", "Daniel Okafor", 5 * HOUR],
    ["ld_008", "Went quiet after discovery. Try looping in the CFO with an ROI summary.", "Daniel Okafor", 9 * DAY],
    ["ld_013", "Security review requested. Share pen-test summary and SSO docs.", "James Carter", 4 * HOUR],
  ];
  return notes.map(([leadId, body, author, ago], i) => ({ id: `nt_${i + 1}`, leadId, body, author, createdAt: now - ago }));
}

function buildTasks(now: number): Task[] {
  const tasks: [leadId: string, title: string, due: number, ownerId: string, done?: boolean][] = [
    ["ld_001", "Send revised proposal with annual pricing", 3 * HOUR, "james"],
    ["ld_001", "Book security review with Acme IT", 2 * DAY, "james"],
    ["ld_001", "Share Harbor & Co case study", -DAY, "james", true],
    ["ld_002", "Prepare close plan for Brightline", DAY, "maya"],
    ["ld_003", "Confirm demo attendees", 5 * HOUR, "daniel"],
    ["ld_004", "Follow up on pricing guide download", -DAY, "sofia"],
    ["ld_005", "Qualify budget and timeline", DAY, "liam"],
    ["ld_006", "Call Priya about intake volumes", 2 * HOUR, "sofia"],
    ["ld_008", "Re-engage Hannah with ROI summary", -2 * DAY, "daniel"],
    ["ld_009", "Send compliance checklist", -DAY, "maya"],
    ["ld_013", "Send pen-test summary and SSO docs", 6 * HOUR, "james"],
  ];
  return tasks.map(([leadId, title, due, ownerId, done], i) => ({
    id: `tk_${i + 1}`,
    leadId,
    title,
    dueAt: now + due,
    done: Boolean(done),
    ownerId,
    createdAt: now - 4 * DAY,
  }));
}

export function createSeed(now = Date.now()): CrmState {
  return {
    version: CRM_VERSION,
    seededAt: now,
    leads: buildLeads(now),
    deals: buildDeals(now),
    notes: buildNotes(now),
    tasks: buildTasks(now),
    activities: [],
    replies: {},
  };
}

/* Derived, deterministic history ----------------------------------------- */

const statusOrder: LeadStatus[] = ["new", "contacted", "qualified", "nurturing", "won", "lost"];

export function activityTypeFor(text: string): ActivityType {
  const t = text.toLowerCase();
  if (/(call|voicemail)/.test(t)) return "call";
  if (/(email|replied|newsletter)/.test(t)) return "email";
  if (/(demo|meeting|webinar|onboarding)/.test(t)) return "meeting";
  if (/(form|signed up|requested)/.test(t)) return "form";
  if (/(contract|invoice|lost|vendor)/.test(t)) return "deal";
  return "web";
}

/** A believable history for every lead, derived from its fields so it never needs storing. */
export function seededTimeline(lead: Lead): Activity[] {
  const rng = mulberry32(hashString(lead.id));
  const created: Omit<Activity, "id" | "leadId"> = lead.seed
    ? {
        type: "form",
        title: `Lead created from ${sourceLabel[lead.source].toLowerCase()}`,
        detail: lead.source === "referral" ? "Referred by an existing customer" : `Landing page: /${pick(rng, ["pricing", "demo", "features", "ai-assistant"])}`,
        at: lead.createdAt,
      }
    : { type: "form", title: "Lead added manually", detail: `Source: ${sourceLabel[lead.source]}`, at: lead.createdAt };
  if (!lead.seed) return [{ ...created, id: `seed_${lead.id}_0`, leadId: lead.id }];

  const { seed } = lead;
  const owner = ownerById(lead.ownerId).name;
  const span = Math.max(seed.at - lead.createdAt, HOUR);
  const at = (fraction: number) => Math.round(lead.createdAt + span * fraction);
  const stage = statusOrder.indexOf(seed.status);
  const items: Omit<Activity, "id" | "leadId">[] = [
    created,
    { type: "email", title: "Opened welcome email", actor: "Nexora AI", at: at(0.12) },
  ];
  if (stage >= 1) {
    items.push({ type: "call", title: `Intro call with ${owner.split(" ")[0]}`, detail: `${4 + Math.floor(rng() * 20)} min · connected`, actor: owner, at: at(0.3) });
  }
  if (stage >= 2 && seed.status !== "nurturing") {
    items.push({ type: "meeting", title: "Discovery meeting", detail: "Reviewed goals, current tools and timeline", actor: owner, at: at(0.5) });
  }
  if (seed.status !== "new") {
    items.push({ type: "status", title: `Status changed to ${statusMeta[seed.status].label}`, actor: owner, at: at(0.7) });
  }
  items.push({ type: "web", title: "Visited pricing page", detail: `${2 + Math.floor(rng() * 4)} pages · ${1 + Math.floor(rng() * 6)} min`, at: at(0.85) });
  items.push({ type: activityTypeFor(seed.activity), title: seed.activity, at: seed.at });
  return items.map((item, i) => ({ ...item, id: `seed_${lead.id}_${i}`, leadId: lead.id }));
}

const topics = [
  "lead routing",
  "follow-up emails",
  "our sales pipeline",
  "customer support replies",
  "appointment booking",
  "reporting",
];

export function seededThreads(lead: Lead): Thread[] {
  if (!lead.seed) return [];
  const rng = mulberry32(hashString(`${lead.id}:threads`));
  const first = lead.name.split(" ")[0];
  const owner = ownerById(lead.ownerId).name;
  const ownerFirst = owner.split(" ")[0];
  const topic = pick(rng, topics);
  const end = lead.seed.at;
  const status = lead.seed.status;
  const msg = (i: number, direction: Message["direction"], body: string, before: number): Message => ({
    id: `seedmsg_${lead.id}_${i}`,
    direction,
    author: direction === "inbound" ? lead.name : owner,
    body,
    at: end - before,
  });

  const email: Thread = {
    id: `th_${lead.id}_email`,
    leadId: lead.id,
    channel: "email",
    subject: status === "new" ? "Demo request" : `${lead.company} × Nexora AI`,
    messages:
      status === "new"
        ? [msg(0, "inbound", `Hi there, we're looking for a way to automate ${topic} at ${lead.company}. Could we see a demo next week?`, 0)]
        : [
            msg(0, "inbound", `Hi, we're exploring tools to automate ${topic}. Do you have time for a quick call this week?`, 3 * DAY),
            msg(1, "outbound", `Hi ${first}, thanks for reaching out! I'd love to learn more. Does Thursday at 2pm work? — ${ownerFirst}`, 3 * DAY - 2 * HOUR),
            msg(2, "inbound", "Thursday works. I'll bring our ops lead as well.", 2 * DAY),
            ...(status === "qualified" || status === "won"
              ? [msg(3, "outbound", "Great meeting today. Attaching the proposal and a short ROI summary — let me know what questions come up.", DAY)]
              : []),
          ],
  };

  if (rng() < 0.5) return [email];

  const chat: Thread = {
    id: `th_${lead.id}_chat`,
    leadId: lead.id,
    channel: "chat",
    subject: "Website chat",
    messages: [
      msg(10, "inbound", "Does Nexora integrate with HubSpot and Gmail?", 6 * DAY),
      msg(11, "outbound", "Yes, both. HubSpot syncs two ways and Gmail threads show up on the contact automatically.", 6 * DAY - 4 * MIN),
      msg(12, "inbound", "Perfect, thanks!", 6 * DAY - 6 * MIN),
    ],
  };
  return [email, chat];
}

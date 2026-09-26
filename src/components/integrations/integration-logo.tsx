import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Simplified brand marks drawn on a 32×32 grid. */
const marks: Record<string, ReactNode> = {
  hubspot: (
    <g fill="#FF7A59">
      <circle cx="19" cy="19" r="6.5" fill="none" stroke="#FF7A59" strokeWidth="3" />
      <rect x="17.5" y="5" width="3" height="8" rx="1.5" />
      <circle cx="19" cy="5.5" r="2.5" />
      <path d="M6 9.5 14.5 15.5" stroke="#FF7A59" strokeWidth="3" strokeLinecap="round" />
      <circle cx="5.5" cy="9" r="2.5" />
      <path d="M13 25 9 28.5" stroke="#FF7A59" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  salesforce: (
    <path
      fill="#00A1E0"
      d="M13.3 8.6a5.6 5.6 0 0 1 4-1.7 5.7 5.7 0 0 1 4.9 2.8 6.8 6.8 0 0 1 2.8-.6A6.9 6.9 0 0 1 32 16a6.9 6.9 0 0 1-8.3 6.8 5 5 0 0 1-4.4 2.6 5 5 0 0 1-2.2-.5 5.7 5.7 0 0 1-10.6-.3 5.3 5.3 0 0 1-1.1.1A5.4 5.4 0 0 1 0 19.3a5.4 5.4 0 0 1 2.6-4.7 6.2 6.2 0 0 1-.5-2.5 6.2 6.2 0 0 1 11.2-3.5Z"
    />
  ),
  pipedrive: (
    <>
      <rect width="32" height="32" rx="8" fill="#017737" />
      <path
        fill="#fff"
        d="M13 27V12.2c0-1.2.9-2.1 2.1-2.1h.3c.3-.8 1.6-1.8 3.3-1.8 3.4 0 5.4 2.8 5.4 6.6 0 4-2.2 6.6-5.4 6.6-1.4 0-2.4-.6-3-1.3V27Zm5.4-8.7c1.8 0 2.8-1.6 2.8-3.9 0-2.4-1-3.8-2.8-3.8-1.9 0-2.9 1.6-2.9 3.9 0 2.2 1 3.8 2.9 3.8Z"
      />
    </>
  ),
  zoho: (
    <g>
      <rect x="3" y="3" width="12" height="12" rx="2.5" fill="#E42527" />
      <rect x="17" y="3" width="12" height="12" rx="2.5" fill="#089949" />
      <rect x="3" y="17" width="12" height="12" rx="2.5" fill="#226DB4" />
      <rect x="17" y="17" width="12" height="12" rx="2.5" fill="#F9B21D" />
    </g>
  ),
  slack: (
    <g>
      <rect x="4" y="10" width="10" height="4" rx="2" fill="#36C5F0" />
      <rect x="10" y="4" width="4" height="5" rx="2" fill="#36C5F0" />
      <rect x="18" y="4" width="4" height="10" rx="2" fill="#2EB67D" />
      <rect x="23" y="10" width="5" height="4" rx="2" fill="#2EB67D" />
      <rect x="18" y="18" width="10" height="4" rx="2" fill="#ECB22E" />
      <rect x="18" y="23" width="4" height="5" rx="2" fill="#ECB22E" />
      <rect x="10" y="18" width="4" height="10" rx="2" fill="#E01E5A" />
      <rect x="4" y="18" width="5" height="4" rx="2" fill="#E01E5A" />
    </g>
  ),
  twilio: (
    <g fill="#F22F46">
      <path d="M16 3a13 13 0 1 0 0 26 13 13 0 0 0 0-26Zm0 22.4a9.4 9.4 0 1 1 0-18.8 9.4 9.4 0 0 1 0 18.8Z" />
      <circle cx="12.6" cy="12.6" r="2.6" />
      <circle cx="19.4" cy="12.6" r="2.6" />
      <circle cx="12.6" cy="19.4" r="2.6" />
      <circle cx="19.4" cy="19.4" r="2.6" />
    </g>
  ),
  whatsapp: (
    <>
      <path fill="#25D366" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Z" />
      <path
        fill="#fff"
        d="M11.7 9.5c.3 0 .6 0 .8.5l1.2 2.7c.1.3 0 .6-.1.8l-.8 1c-.2.2-.2.5 0 .8a9.7 9.7 0 0 0 4.4 3.8c.3.1.6.1.8-.1l1-1.2c.3-.3.6-.3.9-.2l2.6 1.2c.4.2.5.4.4.9-.2 1.3-1.5 2.5-2.9 2.6-1.1.1-2.6-.2-5.3-1.6-3.2-1.8-5.2-5-5.4-5.3-.2-.3-1.3-1.8-1.3-3.5 0-1.6.9-2.4 1.2-2.8.3-.4.8-.5 1.1-.5h.4Z"
      />
    </>
  ),
  gmail: (
    <g>
      <path fill="#4285F4" d="M4 26h5V14.5L2 9.4V24a2 2 0 0 0 2 2Z" />
      <path fill="#34A853" d="M23 26h5a2 2 0 0 0 2-2V9.4l-7 5.1Z" />
      <path fill="#FBBC04" d="M23 7.2v7.3l7-5.1V8.2c0-2.3-2.6-3.6-4.4-2.2Z" />
      <path fill="#EA4335" d="M9 14.5V7.2l7 5.3 7-5.3v7.3l-7 5.2Z" />
      <path fill="#C5221F" d="M2 8.2v1.2l7 5.1V7.2L6.4 6C4.6 4.6 2 5.9 2 8.2Z" />
    </g>
  ),
  teams: (
    <>
      <circle cx="23.5" cy="8.5" r="3.5" fill="#7B83EB" />
      <rect x="17" y="13" width="13" height="12" rx="3" fill="#7B83EB" />
      <rect x="2" y="7" width="18" height="18" rx="3" fill="#5059C9" />
      <path fill="#fff" d="M6.5 11.5h9v2.4h-3.3V21H9.8v-7.1H6.5Z" />
    </>
  ),
  mailchimp: (
    <>
      <circle cx="16" cy="16" r="14" fill="#FFE01B" />
      <path
        fill="#241C15"
        d="M9 21.5V11.2c0-.8.6-1.3 1.3-1.1l.5.2 5.2 5.3 5.2-5.3c.7-.7 1.8-.2 1.8.8v10.4a1.3 1.3 0 1 1-2.6 0v-6.6l-3.5 3.6c-.5.5-1.3.5-1.8 0l-3.5-3.6v6.6a1.3 1.3 0 1 1-2.6 0Z"
      />
    </>
  ),
  "google-ads": (
    <g>
      <rect x="15" y="2.4" width="7.6" height="27" rx="3.8" transform="rotate(-30 18.8 15.9)" fill="#FBBC04" />
      <rect x="9.4" y="5.3" width="7.6" height="23" rx="3.8" transform="rotate(30 13.2 16.8)" fill="#4285F4" />
      <circle cx="7" cy="25" r="4" fill="#34A853" />
    </g>
  ),
  "meta-ads": (
    <path
      fill="none"
      stroke="#0866FF"
      strokeWidth="3.4"
      strokeLinecap="round"
      d="M5 20.5c0-6 2.4-10 5.6-10 4.4 0 7.4 11 10.8 11 2.3 0 3.6-2.4 3.6-5.5 0-3.6-1.7-6-4-6-3.8 0-6.5 11.5-10.4 11.5C7.4 21.5 5 21.3 5 20.5Z"
    />
  ),
  stripe: (
    <>
      <rect width="32" height="32" rx="8" fill="#635BFF" />
      <path
        fill="#fff"
        d="M14.8 12.6c0-.8.7-1.1 1.7-1.1 1.5 0 3.4.5 4.9 1.3V8.3a13 13 0 0 0-4.9-.9c-4 0-6.7 2.1-6.7 5.6 0 5.5 7.5 4.6 7.5 7 0 .9-.8 1.2-1.9 1.2-1.6 0-3.7-.7-5.3-1.6v4.6c1.8.8 3.6 1.1 5.3 1.1 4.1 0 6.9-2 6.9-5.6 0-5.9-7.5-4.8-7.5-7.1Z"
      />
    </>
  ),
  paypal: (
    <g>
      <path fill="#003087" d="M12 28H7.4a.7.7 0 0 1-.7-.8L10.2 5a1.1 1.1 0 0 1 1.1-1h8.4c3.9 0 6.3 2 5.7 5.8-.8 5-4 7.1-8.4 7.1h-2.3a1 1 0 0 0-1 .9Z" />
      <path fill="#009CDE" d="M26.2 10.6c-.8 4.9-4 7.4-8.6 7.4h-1.9a1 1 0 0 0-1 .9L13.6 27.3a.6.6 0 0 0 .6.7h4a.9.9 0 0 0 .9-.8l.8-4.7a.9.9 0 0 1 .9-.8h1.1c3.9 0 6.5-1.9 7.2-6 .4-2.2-.3-4-1.9-5.1Z" />
    </g>
  ),
  square: (
    <>
      <rect width="32" height="32" rx="8" fill="#111" />
      <path fill="#fff" fillRule="evenodd" d="M9.5 6.5h13a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3h-13a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3Zm.5 3.5v12h12V10Z" />
      <rect x="13" y="13" width="6" height="6" rx="1" fill="#fff" />
    </>
  ),
  zapier: (
    <g stroke="#FF4F00" strokeWidth="3.6" strokeLinecap="round">
      <path d="M16 4v24M4 16h24M7.5 7.5l17 17M24.5 7.5l-17 17" />
    </g>
  ),
  make: (
    <>
      <rect width="32" height="32" rx="8" fill="#6D00CC" />
      <g fill="#fff">
        <rect x="7" y="9" width="3.6" height="14" rx="1.2" transform="skewX(-12) translate(3 0)" />
        <rect x="13.4" y="9" width="3.6" height="14" rx="1.2" transform="skewX(-12) translate(3 0)" />
        <rect x="20" y="9" width="3.6" height="14" rx="1.2" />
      </g>
    </>
  ),
  n8n: (
    <g>
      <path d="M6 16h6M15.5 16l5-5M15.5 16l5 5" stroke="#EA4B71" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="5" cy="16" r="3.2" fill="#EA4B71" />
      <circle cx="14" cy="16" r="3.2" fill="#EA4B71" />
      <circle cx="23" cy="9" r="3.2" fill="#EA4B71" />
      <circle cx="23" cy="23" r="3.2" fill="#EA4B71" />
      <path d="M26 23h2.5" stroke="#EA4B71" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  "google-analytics": (
    <g>
      <rect x="20" y="3" width="8" height="26" rx="4" fill="#F9AB00" />
      <rect x="12" y="12" width="8" height="17" rx="4" fill="#E37400" />
      <circle cx="8" cy="25" r="4" fill="#E37400" />
    </g>
  ),
  segment: (
    <g>
      <rect x="4" y="9" width="17" height="4" rx="2" fill="#52BD95" />
      <circle cx="26" cy="11" r="2.4" fill="#52BD95" />
      <rect x="11" y="19" width="17" height="4" rx="2" fill="#52BD95" />
      <circle cx="6" cy="21" r="2.4" fill="#52BD95" />
    </g>
  ),
  mixpanel: (
    <g fill="#7856FF">
      <circle cx="7" cy="16" r="5" />
      <circle cx="18" cy="16" r="3.4" />
      <circle cx="26" cy="16" r="2.2" />
    </g>
  ),
  "google-calendar": (
    <>
      <rect x="4" y="4" width="24" height="24" rx="3" fill="#fff" stroke="#DADCE0" />
      <path fill="#4285F4" d="M4 7a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v3H4Z" />
      <path fill="#EA4335" d="M22 28h3a3 3 0 0 0 3-3v-3h-6Z" />
      <text x="16" y="23.5" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif" fill="#1A73E8">
        31
      </text>
    </>
  ),
  calendly: (
    <>
      <circle cx="16" cy="16" r="13" fill="#006BFF" />
      <path d="M20.5 11.6a6.2 6.2 0 1 0 0 8.8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  outlook: (
    <>
      <rect x="12" y="6" width="17" height="20" rx="2" fill="#28A8EA" />
      <path fill="#0078D4" d="M12 16h17v8a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2Z" />
      <rect x="3" y="9" width="14" height="14" rx="2" fill="#0364B8" />
      <ellipse cx="10" cy="16" rx="3.4" ry="4" fill="none" stroke="#fff" strokeWidth="2" />
    </>
  ),
};

const sizes = { sm: "size-8 p-1.5 rounded-md", md: "size-11 p-2 rounded-lg", lg: "size-14 p-2.5 rounded-xl" };

export function IntegrationLogo({ id, name, size = "md", className }: { id: string; name: string; size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center border border-border bg-white shadow-xs", sizes[size], className)}>
      <svg viewBox="0 0 32 32" className="size-full" role="img" aria-label={`${name} logo`}>
        {marks[id] ?? (
          <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill="#64748b">
            {name[0]}
          </text>
        )}
      </svg>
    </span>
  );
}

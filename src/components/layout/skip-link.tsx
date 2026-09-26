export const MAIN_CONTENT_ID = "main-content";

export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      onClick={(event) => {
        const main = document.getElementById(MAIN_CONTENT_ID);
        if (!main) return;
        event.preventDefault();
        main.focus({ preventScroll: true });
        main.scrollIntoView({ block: "start" });
      }}
      className="sr-only rounded-md bg-ink px-3 py-2 text-sm font-medium text-white shadow-lg outline-none focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus-visible:shadow-focus"
    >
      Skip to content
    </a>
  );
}

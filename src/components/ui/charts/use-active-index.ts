import { useState, type KeyboardEvent } from "react";

export function useActiveIndex(count: number) {
  const [active, setActive] = useState<number | null>(null);

  function onKeyDown(event: KeyboardEvent) {
    if (count === 0) return;
    const keys: Record<string, (current: number | null) => number | null> = {
      ArrowRight: (c) => (c === null ? 0 : Math.min(count - 1, c + 1)),
      ArrowDown: (c) => (c === null ? 0 : Math.min(count - 1, c + 1)),
      ArrowLeft: (c) => (c === null ? count - 1 : Math.max(0, c - 1)),
      ArrowUp: (c) => (c === null ? count - 1 : Math.max(0, c - 1)),
      Home: () => 0,
      End: () => count - 1,
      Escape: () => null,
    };
    const next = keys[event.key];
    if (!next) return;
    event.preventDefault();
    setActive(next);
  }

  const activeIndex = active !== null && active < count ? active : null;

  return {
    active: activeIndex,
    setActive,
    containerProps: {
      tabIndex: 0,
      onKeyDown,
      onBlur: () => setActive(null),
    },
  };
}

export const chartFocusClass = "rounded-md outline-none focus-visible:shadow-focus";

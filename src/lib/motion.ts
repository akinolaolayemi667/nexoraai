import type { Transition, Variants } from "framer-motion";

export const duration = {
  instant: 0.08,
  fast: 0.12,
  base: 0.18,
  slow: 0.26,
  slower: 0.4,
} as const;

export const ease = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
} as const;

export const transitions = {
  fast: { duration: duration.fast, ease: ease.standard },
  base: { duration: duration.base, ease: ease.standard },
  emphasized: { duration: duration.slow, ease: ease.emphasized },
  exit: { duration: duration.fast, ease: ease.exit },
  spring: { type: "spring", stiffness: 500, damping: 40 },
} satisfies Record<string, Transition>;

/** Spread onto a motion element to drive the shared `hidden → visible → exit` states. */
export const motionStates = {
  initial: "hidden",
  animate: "visible",
  exit: "exit",
} as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
  exit: { opacity: 0, transition: transitions.exit },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitions.emphasized },
  exit: { opacity: 0, y: 4, transition: transitions.exit },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: transitions.emphasized },
  exit: { opacity: 0, scale: 0.98, transition: transitions.exit },
};

export type SlideDirection = "left" | "right" | "up" | "down";

export function slideIn(direction: SlideDirection = "right", distance: number | string = 16): Variants {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "right" || direction === "down" ? 1 : -1;
  const offset = typeof distance === "number" ? distance * sign : sign === 1 ? distance : `-${distance}`;
  const from = axis === "x" ? { x: offset } : { y: offset };
  const to = axis === "x" ? { x: 0 } : { y: 0 };
  return {
    hidden: { opacity: 0, ...from },
    visible: { opacity: 1, ...to, transition: transitions.emphasized },
    exit: { opacity: 0, ...from, transition: { duration: duration.base, ease: ease.exit } },
  };
}

export function staggerChildren(stagger = 0.04, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
    exit: { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
}

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.emphasized } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.exit } },
};

const glassEase = [0.22, 1, 0.36, 1] as const;

export const glassFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: glassEase } },
  exit: { opacity: 0, transition: transitions.exit },
};

export const glassSlideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: glassEase } },
  exit: { opacity: 0, y: 8, transition: transitions.exit },
};

export const glassScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: glassEase } },
  exit: { opacity: 0, scale: 0.98, transition: transitions.exit },
};

/** Soft focus-pull: content resolves from a light blur. Use sparingly on hero-level surfaces. */
export const glassReveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: glassEase } },
  exit: { opacity: 0, transition: transitions.exit },
};

export function staggerGlass(stagger = 0.08, delayChildren = 0.05): Variants {
  return staggerChildren(stagger, delayChildren);
}

export const motionPresets = {
  fadeIn,
  fadeUp,
  scaleIn,
  pageTransition,
  glassFadeIn,
  glassSlideUp,
  glassScaleIn,
  glassReveal,
} as const;
export type MotionPreset = keyof typeof motionPresets;

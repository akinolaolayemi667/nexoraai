import type { ReactNode } from "react";
import { MotionConfig, motion, type HTMLMotionProps } from "framer-motion";
import {
  motionPresets,
  motionStates,
  pageTransition,
  slideIn,
  staggerChildren,
  transitions,
  type MotionPreset,
  type SlideDirection,
} from "@/lib/motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={transitions.base}>
      {children}
    </MotionConfig>
  );
}

type MotionDivProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "animate" | "exit">;

export type FadeInProps = MotionDivProps & {
  preset?: Exclude<MotionPreset, "pageTransition"> | `slide-${SlideDirection}`;
  delay?: number;
  inView?: boolean;
};

function resolvePreset(preset: NonNullable<FadeInProps["preset"]>) {
  if (preset.startsWith("slide-")) return slideIn(preset.slice(6) as SlideDirection);
  return motionPresets[preset as Exclude<MotionPreset, "pageTransition">];
}

export function FadeIn({ preset = "fadeUp", delay = 0, inView = false, transition, ...props }: FadeInProps) {
  const variants = resolvePreset(preset);
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-40px" } }
        : { animate: "visible" })}
      exit="exit"
      transition={delay ? { delay, ...transition } : transition}
      {...props}
    />
  );
}

export type StaggerProps = MotionDivProps & {
  stagger?: number;
  delay?: number;
  inView?: boolean;
};

export function Stagger({ stagger = 0.04, delay = 0, inView = false, ...props }: StaggerProps) {
  return (
    <motion.div
      variants={staggerChildren(stagger, delay)}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-40px" } }
        : { animate: "visible" })}
      exit="exit"
      {...props}
    />
  );
}

export function StaggerItem({
  preset = "fadeUp",
  ...props
}: MotionDivProps & { preset?: FadeInProps["preset"] }) {
  return <motion.div variants={resolvePreset(preset)} {...props} />;
}

export function PageTransition(props: MotionDivProps) {
  return <motion.div variants={pageTransition} {...motionStates} {...props} />;
}

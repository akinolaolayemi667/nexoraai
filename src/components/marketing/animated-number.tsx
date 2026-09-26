import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";

export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const spring = useSpring(reduced ? value : value * 0.9, { stiffness: 90, damping: 22, mass: 0.8 });
  const display = useTransform(spring, format);

  useEffect(() => {
    if (reduced) spring.jump(value);
    else spring.set(value);
  }, [value, reduced, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}

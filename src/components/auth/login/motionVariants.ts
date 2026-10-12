import type { Variants } from "framer-motion";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Entrance timeline (seconds):
 * 0.00  background veil lifts (0.8s)
 * 0.15  waves rise in (0.9s)
 * 0.30  brand header fades in
 * 0.45  heading → description → form fields → button, staggered
 */
export const contentStagger: Variants = {
    hidden: {},
    visible: {
        transition: { delayChildren: 0.45, staggerChildren: 0.08 },
    },
};

export const groupStagger: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.07 },
    },
};

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: EASE_OUT },
    },
};

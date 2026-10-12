import { motion, useReducedMotion } from "framer-motion";
import { loginPalette } from "./loginTheme";

interface Particle {
    /** Position as a percentage of the particle area. */
    x: number;
    y: number;
    size: number;
    opacity: number;
    /** Upward drift in px at the peak of the cycle. */
    drift: number;
    duration: number;
    delay: number;
    desktopOnly?: boolean;
}

// Fixed layout keeps renders stable and avoids hydration-style mismatches from Math.random.
const PARTICLES: Particle[] = [
    { x: 6, y: 22, size: 3, opacity: 0.18, drift: 14, duration: 9, delay: 0 },
    { x: 14, y: 64, size: 2, opacity: 0.22, drift: 10, duration: 11, delay: 1.2 },
    { x: 21, y: 38, size: 4, opacity: 0.12, drift: 18, duration: 13, delay: 0.6, desktopOnly: true },
    { x: 29, y: 12, size: 2, opacity: 0.2, drift: 12, duration: 10, delay: 2.4, desktopOnly: true },
    { x: 34, y: 78, size: 3, opacity: 0.16, drift: 16, duration: 12, delay: 0.3 },
    { x: 42, y: 30, size: 2, opacity: 0.14, drift: 10, duration: 8, delay: 1.8, desktopOnly: true },
    { x: 57, y: 16, size: 3, opacity: 0.18, drift: 14, duration: 11, delay: 0.9 },
    { x: 63, y: 70, size: 2, opacity: 0.2, drift: 12, duration: 9, delay: 2.1, desktopOnly: true },
    { x: 71, y: 42, size: 4, opacity: 0.1, drift: 20, duration: 14, delay: 0.2 },
    { x: 78, y: 10, size: 2, opacity: 0.22, drift: 10, duration: 10, delay: 1.5, desktopOnly: true },
    { x: 84, y: 58, size: 3, opacity: 0.16, drift: 16, duration: 12, delay: 0.7 },
    { x: 91, y: 28, size: 2, opacity: 0.2, drift: 12, duration: 9, delay: 2.8, desktopOnly: true },
    { x: 95, y: 80, size: 3, opacity: 0.14, drift: 14, duration: 13, delay: 1.1 },
    { x: 49, y: 86, size: 2, opacity: 0.18, drift: 10, duration: 10, delay: 3.2, desktopOnly: true },
];

export default function FloatingParticles() {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 bottom-[calc(var(--wave-h)*0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2 }}
        >
            {PARTICLES.map((p, i) => (
                <motion.span
                    key={i}
                    className={`absolute rounded-full ${p.desktopOnly ? "hidden md:block" : ""}`}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        opacity: p.opacity,
                        backgroundColor: loginPalette.particle,
                    }}
                    animate={
                        reduceMotion
                            ? undefined
                            : { y: [0, -p.drift, 0], opacity: [p.opacity, p.opacity * 2.2, p.opacity] }
                    }
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />
            ))}
        </motion.div>
    );
}

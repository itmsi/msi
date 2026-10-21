import { motion, useReducedMotion, Variants } from "framer-motion";
import { EASE_OUT, SUCCESS_DURATION } from "./motionVariants";
import { loginPalette } from "./loginTheme";

// Each SVG spans two wave periods so it can sway horizontally without exposing an edge.
const PERIOD = 1440;
const VIEW_W = PERIOD * 2;
const VIEW_H = 300;
const STEP = 30;

/** [cycles per period, amplitude, phase] — integer cycles keep the curve periodic. */
type Harmonic = [number, number, number];

interface WaveLayer {
    fill: string;
    baseline: number;
    harmonics: Harmonic[];
    /** Seconds for one sway in a single direction. */
    duration: number;
    /** Horizontal sway distance, as a percentage of the layer width. */
    sway: number;
    reverse?: boolean;
    className?: string;
}

const SURGE = 0.8;
const SURGE_START = 0.15;
const SURGE_END = 0.6;

function surgeAt(x: number): number {
    const t = Math.min(Math.max((x / PERIOD - SURGE_START) / (SURGE_END - SURGE_START), 0), 1);
    const eased = t * t * (3 - 2 * t);
    return 1 + SURGE * (1 - eased);
}

function buildWavePath(baseline: number, harmonics: Harmonic[]): string {
    const yAt = (x: number) =>
        baseline +
        surgeAt(x) *
            harmonics.reduce(
                (sum, [cycles, amp, phase]) => sum + amp * Math.sin((2 * Math.PI * cycles * x) / PERIOD + phase),
                0,
            );

    // Sample one step beyond each edge so Catmull-Rom tangents stay correct at the boundaries.
    const points: [number, number][] = [];
    for (let x = -STEP; x <= VIEW_W + STEP; x += STEP) {
        points.push([x, yAt(x)]);
    }

    const f = (n: number) => n.toFixed(1);
    let d = `M0,${VIEW_H} L0,${f(points[1][1])}`;
    for (let i = 1; i < points.length - 2; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];
        const [x3, y3] = points[i + 2];
        d += ` C${f(x1 + (x2 - x0) / 6)},${f(y1 + (y2 - y0) / 6)} ${f(x2 - (x3 - x1) / 6)},${f(y2 - (y3 - y1) / 6)} ${f(x2)},${f(y2)}`;
    }
    return `${d} L${VIEW_W},${VIEW_H} Z`;
}

// Back to front: darker and slower at the back, lighter and slightly quicker at the front.
const LAYERS: (WaveLayer & { path: string })[] = (
    [
        { fill: loginPalette.waves[0], baseline: 70, harmonics: [[1, 22, 0.4], [2, 10, 1.7]], duration: 24, sway: 10 },
        { fill: loginPalette.waves[1], baseline: 112, harmonics: [[1, 18, 2.1], [3, 6, 0.3]], duration: 21, sway: 12, reverse: true, className: "hidden sm:block" },
        { fill: loginPalette.waves[2], baseline: 160, harmonics: [[2, 14, 1.2], [1, 8, 3.0]], duration: 18, sway: 9 },
        { fill: loginPalette.waves[3], baseline: 202, harmonics: [[1, 12, 4.0], [2, 6, 0.8]], duration: 15, sway: 11, reverse: true },
        { fill: loginPalette.waves[4], baseline: 238, harmonics: [[1, 8, 1.0], [2, 4, 2.5]], duration: 13, sway: 8 },
    ] satisfies WaveLayer[]
).map((layer) => ({ ...layer, path: buildWavePath(layer.baseline, layer.harmonics) }));

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30, scaleY: 1 },
    visible: { opacity: 1, y: 0, scaleY: 1, transition: { delay: 0.15, duration: 0.9, ease: EASE_OUT } },
    settled: { opacity: 1, y: 0, scaleY: 0.35, transition: { duration: SUCCESS_DURATION, ease: EASE_OUT } },
};

interface AnimatedWaveBackgroundProps {
    settled?: boolean;
}

export default function AnimatedWaveBackground({ settled = false }: AnimatedWaveBackgroundProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-(--wave-h) overflow-hidden"
            style={{ originY: 1 }}
            variants={containerVariants}
            initial="hidden"
            animate={settled ? "settled" : "visible"}
        >
            {LAYERS.map((layer) => {
                const from = layer.reverse ? `-${layer.sway}%` : "0%";
                const to = layer.reverse ? "0%" : `-${layer.sway}%`;

                return (
                    <motion.svg
                        key={layer.fill}
                        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                        preserveAspectRatio="none"
                        className={`absolute bottom-0 left-0 h-full w-[200%] ${layer.className ?? ""}`}
                        initial={{ x: from }}
                        animate={reduceMotion ? undefined : { x: [from, to] }}
                        transition={{
                            duration: layer.duration,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "mirror",
                        }}
                    >
                        {/* style (not the fill attribute) so CSS variables like --color-primary resolve */}
                        <path d={layer.path} style={{ fill: layer.fill }} />
                    </motion.svg>
                );
            })}
        </motion.div>
    );
}

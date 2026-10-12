import type { CSSProperties } from "react";
import { motion, MotionConfig } from "framer-motion";
import PageMeta from "../../components/common/PageMeta";
import SignInForm from "../../components/auth/SignInForm";
import AnimatedWaveBackground from "../../components/auth/login/AnimatedWaveBackground";
import FloatingParticles from "../../components/auth/login/FloatingParticles";
import { EASE_OUT, contentStagger, fadeUp } from "../../components/auth/login/motionVariants";
import { loginThemeVars } from "../../components/auth/login/loginTheme";

const pageStyle = {
    ...loginThemeVars,
    // Height of the bottom wave composition; the form area reserves space above it.
    "--wave-h": "clamp(170px, 50vh, 300px)",
} as CSSProperties;

export default function SignIn() {
    return (
        <>
            <PageMeta
                title="Motor Sights International - Sign In"
                description="Motor Sights International - Sign In Page"
                image="/motor-sights-international.png"
            />
            {/* "user" drops transform-based entrance motion when prefers-reduced-motion is set, keeping fades */}
            <MotionConfig reducedMotion="user">
                <div className="relative flex min-h-dvh flex-col overflow-x-clip font-primary text-(--login-text)" style={pageStyle}>
                    {/* Dim veil that lifts on load so the background "reveals" */}
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-(--login-veil)"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: EASE_OUT }}
                    />
                    <FloatingParticles />
                    <AnimatedWaveBackground />

                    <motion.header
                        className="relative z-10 flex items-center px-4 pt-5 sm:px-8 sm:pt-7 lg:px-12"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: EASE_OUT }}
                    >
                        <img
                            src="/motor-sights-international-logo-white.svg"
                            alt="Motor Sights International"
                            width={800}
                            height={489}
                            className="h-10 w-auto opacity-90 sm:h-12"
                        />
                    </motion.header>

                    <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-[calc(var(--wave-h)*0.2)] sm:px-6"
                    >
                        <motion.div
                            className="w-full max-w-100"
                            initial="hidden"
                            animate="visible"
                            variants={contentStagger}
                        >
                            <motion.div className="p-6 shadow-[0px_0px_16px_-6px_#0253a5] bg-[#011d3a]/50 backdrop-blur-lg rounded-xl border border-white/30">
                                <motion.h1
                                    variants={fadeUp}
                                    className="text-center font-main-bold text-[1.75rem] leading-tight tracking-tight sm:text-3xl"
                                >
                                    Welcome back
                                </motion.h1>
                                <motion.p
                                    variants={fadeUp}
                                    className="mt-2 mb-6 text-center text-sm leading-relaxed text-(--login-text)"
                                >
                                    Sign in with your Motor Sights International credentials.
                                </motion.p>
                                <SignInForm />
                            </motion.div>
                        </motion.div>
                    </main>

                    <motion.footer
                        className="absolute inset-x-0 bottom-0 z-10 px-4 pb-3 text-center text-xs text-(--login-text-muted) sm:pb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        &copy; {new Date().getFullYear()} Motor Sights International. All rights reserved.
                    </motion.footer>
                </div>
            </MotionConfig>
        </>
    );
}

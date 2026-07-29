"use client";

import { type FC, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MarkdownText } from "./markdown-text";

export const StreamingCursor: FC = () => (
    <motion.span
        className="inline-block w-[3px] h-[14px] bg-[#0253a5] ml-0.5 rounded-full align-middle"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
    />
);

export const TypingText: FC<{ content: string; isRunning: boolean }> = ({ content, isRunning }) => {
    const initialFull = !isRunning;
    const [visibleLen, setVisibleLen] = useState(initialFull ? content.length : 0);
    const rafRef = useRef<number>(0);
    const visibleLenRef = useRef(initialFull ? content.length : 0);
    const contentRef = useRef(content);

    contentRef.current = content;

    useEffect(() => {
        if (visibleLenRef.current >= content.length) return;
        if (rafRef.current) return;

        const animate = () => {
            const target = contentRef.current.length;
            const current = visibleLenRef.current;

            if (current >= target) {
                rafRef.current = 0;
                return;
            }

            const lag = target - current;
            const charsPerFrame = lag > 200 ? 8 : lag > 50 ? 4 : 2;

            visibleLenRef.current = Math.min(current + charsPerFrame, target);
            setVisibleLen(visibleLenRef.current);

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content.length]);

    const displayText = content.slice(0, visibleLen);
    const isAnimating = visibleLen < content.length;
    const showCursor = isRunning || isAnimating;

    return (
        <>
            <MarkdownText content={displayText} />
            {showCursor && <StreamingCursor />}
        </>
    );
};

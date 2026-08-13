import React, { useEffect, useRef, useState } from "react";
import DOMPurify, { Config } from "dompurify";

interface LazyHtmlContentProps {
    html: string;
    className?: string;
    sanitizeConfig?: Config;
    placeholder?: React.ReactNode;
}

export function LazyHtmlContent({ html, className, sanitizeConfig, placeholder }: LazyHtmlContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const node = containerRef.current;
        if (!node || shouldRender) return;

        if (typeof IntersectionObserver === "undefined") {
            setShouldRender(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setShouldRender(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "300px" }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [shouldRender]);

    return (
        <div ref={containerRef} className={className}>
            {shouldRender ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html, sanitizeConfig) }} />
            ) : (
                placeholder ?? <div className="h-16 animate-pulse bg-gray-100 rounded-lg" />
            )}
        </div>
    );
}

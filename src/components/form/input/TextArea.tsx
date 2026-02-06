import clsx from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

interface TextareaProps {
    placeholder?: string;
    rows?: number;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
    disabled?: boolean;
    error?: boolean;
    readonly?: boolean;
    hint?: string;
}

const TextArea: React.FC<TextareaProps> = ({
    placeholder = "Enter your message",
    rows = 3,
    value = "",
    onChange,
    className = "",
    disabled = false,
    error = false,
    readonly = false,
    hint = "",
}) => {

    let textareaClasses = `font-secondary w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3:text-white/30 ${className}`;

    if (disabled) {
        textareaClasses += ` text-gray-500 border-gray-300 opacity-80 bg-gray-100`;
    } else if (error) {
        textareaClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20:border-error-800`;
    } else if (readonly) {
        textareaClasses += `  border-gray-300 border-0 border-b-1 rounded-none focus:border-gray-300 focus:ring-gray-300`;
    } else {
        textareaClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20:border-brand-800`;
    }

    return (
        <div className="relative">
            <textarea
                placeholder={placeholder}
                rows={rows}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={clsx(
                    twMerge(
                        textareaClasses,
                        className,
                    ),
                )}
            />
            {hint && (
                <p
                    className={`mt-2 text-sm ${
                        error ? "text-error-500" : "text-gray-500"
                    }`}
                >
                    {hint}
                </p>
            )}
        </div>
    );
};

export default TextArea;

import clsx from "clsx";
import type React from "react";
import type { FC } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps {
    type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
    id?: string;
    name?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    className?: string;
    min?: string;
    max?: string;
    step?: number;
    maxLength?: number;
    disabled?: boolean;
    success?: boolean;
    error?: boolean;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    hint?: string;
    readonly?: boolean;
}

const Input: FC<InputProps> = ({
    type = "text",
    id,
    name,
    placeholder,
    value,
    onChange,
    onBlur,
    className = "",
    min,
    max,
    step,
    maxLength,
    disabled = false,
    success = false,
    error = false,
    onKeyPress,
    hint,
    readonly = false,
}) => {
    let inputClasses = `font-secondary h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3:text-white/30 ${className}`;

    if (disabled) {
        inputClasses += ` text-gray-500 border-gray-300 opacity-80 bg-gray-100`;
    } else if (error) {
        inputClasses += `  border-error-500 focus:border-error-300 focus:ring-error-500/20:border-error-800`;
    } else if (success) {
        inputClasses += `  border-success-500 focus:border-success-300 focus:ring-success-500/20:border-success-800`;
    } else if (readonly) {
        inputClasses += `  border-gray-300 border-0 border-b-1 rounded-none focus:border-gray-300 focus:ring-gray-300`;
    } else {
        inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20:border-brand-800`;
    }

    return (
        <div className="relative">
            <input
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                min={min}
                max={max}
                step={step}
                maxLength={maxLength}
                disabled={disabled}
                readOnly={readonly}
                className={clsx(
                    twMerge(
                        inputClasses,
                        className,
                    ),
                )}
                onKeyDown={onKeyPress}
            />

            {hint && (
                <p
                    className={`mt-1.5 text-xs ${
                        error
                        ? "text-error-500"
                        : success
                        ? "text-success-500"
                        : "text-gray-500"
                    }`}
                >
                    {hint}
                </p>
            )}
        </div>
    );
};

export default Input;

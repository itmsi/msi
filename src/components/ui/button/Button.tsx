import clsx from "clsx";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
    children: ReactNode;
    size?: "sm" | "md";
    variant?: "primary" | "outline" | "transparent";
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
    children,
    size = "md",
    variant = "primary",
    startIcon,
    endIcon,
    onClick,
    className = "",
    disabled = false,
    type = "submit",
}) => {
    // Size Classes
    const sizeClasses = {
        sm: "px-4 py-3 text-sm",
        md: "px-5 py-3.5 text-sm",
    };

    // Variant Classes
    const variantClasses = {
        primary:
            "bg-[#0253a5] text-white shadow-theme-xs hover:bg-[#003061] hover:shadow-md disabled:bg-brand-300",
        outline:
            "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50:bg-white/[0.03]:text-gray-300",
        transparent:
            "bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400",
    };

    return (
        <button
            className={clsx(
                twMerge(
                    `inline-flex items-center justify-center gap-2 rounded-lg transition ${
                        sizeClasses[size]
                    } ${variantClasses[variant]} ${
                        disabled ? "cursor-not-allowed opacity-50" : ""
                    }`,
                    className,
                ),
            )}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {startIcon && <span className="flex items-center">{startIcon}</span>}
            {children}
            {endIcon && <span className="flex items-center">{endIcon}</span>}
        </button>
    );
};

export default Button;

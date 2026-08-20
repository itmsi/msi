import { LuArrowDown } from "react-icons/lu";
import Button from "./Button";


interface DownloadButtonProps {
    fileName?: string;
    fileSize?: string;
    variant?: "primary" | "secondary" | "ghost";
    loading?: boolean;
    disabled?: boolean;
    showIcon?: boolean;
    showLabel?: boolean;
    onClick?: () => void;
}

const Spinner = () => (
    <svg
        className="animate-spin h-4 w-4"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
    </svg>
);
const DownloadIcon = ({ variant }: { variant: string }) => {
    const base =
        "flex items-center justify-center rounded-full";

    const size = "w-7 h-7"; // consistent size

    const styles = {
        primary:
            "bg-gradient-to-br from-white/20 to-white/10 text-white",
        secondary:
            "bg-gradient-to-br from-white to-gray-200 text-blue-700",
        ghost:
            "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600",
    };

    return (
        <span className={`${base} ${size} ${styles[variant as keyof typeof styles]}`}>
            <LuArrowDown size={16} />
        </span>
    );
};
export const DownloadButton = ({
    fileName,
    fileSize,
    variant = "primary",
    loading = false,
    disabled = false,
    showIcon = true,
    showLabel = true,
    onClick,
}: DownloadButtonProps) => {
    return (
        <Button
            onClick={onClick}
            variant="outline"
            size="sm"
            disabled={loading || disabled}
            className={`px-1.5 py-1 rounded-full transition hover:shadow-md h-9 ring-0 bg-gradient-to-br from-gray-100 to-blue-200 ${loading || disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            {loading ? (
                <>
                    <Spinner />
                    <span>Preparing file...</span>
                </>
            ) : (
                <>
                    {showIcon && <DownloadIcon variant={variant} />}

                    {showLabel && (
                        <span className="mr-2">
                            {fileName}
                            {fileSize && ` (${fileSize})`}
                        </span>
                    )}
                </>
            )}
        </Button>
    );
};
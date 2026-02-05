import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown } from "react-icons/hi2";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { AccordionItemProps } from "./types";

const AccordionItem: React.FC<AccordionItemProps> = ({
    item,
    isOpen,
    onToggle,
    className = "",
}) => {
    const { judul, konten, disabled = false } = item;

    return (
        <div
            className={twMerge(
                clsx(
                    "border border-gray-200 rounded-lg overflow-hidden",
                    "transition-all duration-200",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )
            )}
        >
            {/* Header */}
            <button
                onClick={disabled ? undefined : onToggle}
                disabled={disabled}
                className={clsx(
                    "w-full px-4 py-3 text-left",
                    "flex items-center justify-between",
                    "font-medium text-gray-700",
                    "transition-colors duration-200",
                    "focus:outline-none",
                    // Background colors berdasarkan state
                    isOpen 
                        ? "bg-[#dfe8f2] border-b border-gray-200" 
                        : "bg-gray-50 hover:bg-gray-100",
                    disabled && "hover:bg-gray-50 cursor-not-allowed"
                )}
            >
                <span>{judul}</span>
                <HiChevronDown
                    className={clsx(
                        "w-5 h-5 text-gray-500 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Konten */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { duration: 0.3, ease: "easeInOut" },
                            opacity: { duration: 0.2, ease: "easeInOut" }
                        }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 py-3 bg-white text-gray-600">
                            {konten}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccordionItem;
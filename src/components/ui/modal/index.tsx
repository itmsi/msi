import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    className?: string;
    classTitle?: string;
    children: React.ReactNode;
    showCloseButton?: boolean; // New prop to control close button visibility
    isFullscreen?: boolean; // Default to false for backwards compatibility
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    className,
    classTitle,
    showCloseButton = true, // Default to true for backwards compatibility
    isFullscreen = false,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const contentClasses = isFullscreen
        ? "w-full h-full"
        : "relative w-full rounded-3xl bg-white dark:bg-gray-900";

    // Animation variants for the backdrop
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    // Animation variants for the modal content
    const modalVariants = {
        hidden: { 
            opacity: 0, 
            scale: 0.8,
            y: 50
        },
        visible: { 
            opacity: 1, 
            scale: 1,
            y: 0
        },
        exit: { 
            opacity: 0, 
            scale: 0.8,
            y: 50
        }
    };

    // Transition settings
    const springTransition = {
        type: "spring" as const,
        stiffness: 400,
        damping: 30
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div 
                    className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={backdropVariants}
                    transition={{ duration: 0.3 }}
                >
                    {!isFullscreen && (
                        <motion.div
                            className="fixed inset-0 h-full w-full bg-gray-950/80 backdrop-blur-[5px]"
                            onClick={onClose}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                    )}
                    <motion.div
                        ref={modalRef}
                        className={`${contentClasses} ${className}`}
                        onClick={(e) => e.stopPropagation()}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={springTransition}
                    >
                        {showCloseButton && (
                            <motion.button
                                onClick={onClose}
                                className="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
                                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                                transition={{ 
                                    duration: 0.3,
                                    delay: isOpen ? 0.2 : 0,
                                    ease: "easeInOut"
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                                    fill="currentColor"
                                />
                                </svg>
                            </motion.button>
                        )}
                        {title && (
                            <motion.div 
                                className={clsx(
                                    twMerge(
                                        "modal-title bg-[#0253a5] text-white p-6 rounded-t-3xl",
                                        classTitle,
                                    ),
                                )}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ 
                                    duration: 0.3,
                                    delay: isOpen ? 0.1 : 0,
                                    ease: "easeInOut"
                                }}
                            >
                                <h3 className="text-lg font-medium">
                                    {title}
                                </h3>
                                {description && (
                                    <p className="mt-1 text-sm">
                                        {description}
                                    </p>
                                )}
                            </motion.div>
                        )}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ 
                                duration: 0.3,
                                delay: isOpen ? 0.15 : 0,
                                ease: "easeInOut"
                            }}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

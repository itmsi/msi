import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface OffcanvasProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    className?: string;
    classTitle?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
    position?: 'left' | 'right';
}

export const Offcanvas: React.FC<OffcanvasProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    className,
    classTitle,
    showCloseButton = true,
    width = 'lg',
    position = 'right',
}) => {
    const offcanvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Width classes mapping
    const widthClasses = {
        sm: 'w-80',
        md: 'w-96',
        lg: 'w-[32rem]',
        xl: 'w-[40rem]',
        xxl: 'md:w-[70%] w-full',
        full: 'w-full'
    };

    // Position classes and animation variants
    const positionClasses = position === 'right' ? 'right-0' : 'left-0';
    
    const slideVariants = {
        hidden: { 
            x: position === 'right' ? '100%' : '-100%',
            opacity: 0
        },
        visible: { 
            x: 0,
            opacity: 1
        },
        exit: { 
            x: position === 'right' ? '100%' : '-100%',
            opacity: 0
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const springTransition = {
        type: "spring" as const,
        stiffness: 400,
        damping: 30
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-100 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={backdropVariants}
                        transition={{ duration: 0.3 }}
                    />
                    
                    {/* Offcanvas */}
                    <motion.div
                        ref={offcanvasRef}
                        className={twMerge(
                            "absolute top-0 h-full bg-white shadow-xl flex flex-col",
                            positionClasses,
                            widthClasses[width],
                            className
                        )}
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={springTransition}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        {title && (
                            <motion.div 
                                className={clsx(
                                    twMerge(
                                        "flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50",
                                        classTitle
                                    )
                                )}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div>
                                    <h3 className="text-lg font-primary-bold font-medium text-gray-900">
                                        {title}
                                    </h3>
                                    {description && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            {description}
                                        </p>
                                    )}
                                </div>
                                
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                                        aria-label="Close"
                                    >
                                        <svg
                                            width="20"
                                            height="20"
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
                                    </button>
                                )}
                            </motion.div>
                        )}
                        
                        {/* Content */}
                        <motion.div
                            className="flex-1 overflow-y-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Offcanvas;
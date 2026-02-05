import { useState, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import AccordionItem from "./AccordionItem";
import { AccordionProps } from "./types";

const Accordion: React.FC<AccordionProps> = ({
    items,
    allowMultiple = false,
    defaultOpenItems = [],
    defaultOpenAll = false,
    className = "",
    itemClassName = "",
    onItemToggle
}) => {
    const [openItems, setOpenItems] = useState<Set<string>>(
        new Set(defaultOpenAll ? items.map(item => item.id) : defaultOpenItems)
    );

    const handleToggle = useCallback((itemId: string) => {
        setOpenItems(prev => {
            const newOpenItems = new Set(prev);
            const isCurrentlyOpen = newOpenItems.has(itemId);

            if (isCurrentlyOpen) {
                newOpenItems.delete(itemId);
            } else {
                if (allowMultiple) {
                    newOpenItems.add(itemId);
                } else {
                    newOpenItems.clear();
                    newOpenItems.add(itemId);
                }
            }

            // Callback untuk parent component jika diperlukan
            onItemToggle?.(itemId, !isCurrentlyOpen);

            return newOpenItems;
        });
    }, [allowMultiple, onItemToggle]);

    return (
        <div className={twMerge(clsx("space-y-2", className))}>
            {items.map((item) => (
                <AccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openItems.has(item.id)}
                    onToggle={() => handleToggle(item.id)}
                    className={itemClassName}
                />
            ))}
        </div>
    );
};

export default Accordion;
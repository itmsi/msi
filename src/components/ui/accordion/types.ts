import { ReactNode } from "react";

export interface AccordionItemData {
    id: string;
    judul: string;
    konten: ReactNode;
    disabled?: boolean;
}

export interface AccordionItemProps {
    item: AccordionItemData;
    isOpen: boolean;
    onToggle: () => void;
    className?: string;
}

export interface AccordionProps {
    items: AccordionItemData[];
    allowMultiple?: boolean;
    defaultOpenItems?: string[];
    defaultOpenAll?: boolean;
    className?: string;
    itemClassName?: string;
    onItemToggle?: (itemId: string, isOpen: boolean) => void;
}
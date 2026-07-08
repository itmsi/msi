import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi2';

interface HRAccordionItem {
  id: string;
  judul: ReactNode;
  konten: ReactNode;
}

interface HRAccordionProps {
  items: HRAccordionItem[];
  allowMultiple?: boolean;
  defaultOpenAll?: boolean;
}

const HRAccordion = ({ items, allowMultiple = false, defaultOpenAll = false }: HRAccordionProps) => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(defaultOpenAll ? items.map((item) => item.id) : [])
  );

  const handleToggle = (itemId: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        if (!allowMultiple) next.clear();
        next.add(itemId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id} className="border border-gray-200 rounded-lg">
            {/* Header */}
            <button
              type="button"
              onClick={() => handleToggle(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 ${
                isOpen ? 'bg-[#dfe8f2] border-b border-gray-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm font-semibold text-gray-800">{item.judul}</span>
              <HiChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ height: { duration: 0.3, ease: 'easeInOut' }, opacity: { duration: 0.2 } }}
                >
                  <div className="px-4 py-3 bg-white text-gray-600">{item.konten}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default HRAccordion;

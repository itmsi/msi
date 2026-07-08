import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';

export interface SwitcherOption<T extends string = string> {
    value: T;
    label: string;
    /** contoh: "text-red-600 bg-red-50" — dipakai saat option ini aktif */
    color?: string;
}

interface ButtonSwitcherProps<T extends string = string> {
    options: SwitcherOption<T>[];
    value: T;
    onChange: (option: SwitcherOption<T>) => void;
    className?: string;
    defaultActiveClassName?: string; // capsule bg saat opsi tanpa color terpilih
}

export function ButtonSwitcher<T extends string = string>({
    options,
    value,
    onChange,
    className = '',
    defaultActiveClassName = 'bg-white',
}: ButtonSwitcherProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    // activeKey = tombol yang SEKARANG ditempati capsule (hover jika ada, kalau tidak ya yang selected)
    const activeKey = hoveredKey ?? value;
    const activeOption = options.find((o) => o.value === activeKey);

    // capsule "putih" terjadi saat hover ke tombol yang BUKAN yang sedang selected
    const isCapsuleWhite = hoveredKey !== null && hoveredKey !== value;

    const updateIndicator = useCallback((key: string) => {
        const btn = btnRefs.current[key];
        const container = containerRef.current;
        if (!btn || !container) return;
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setIndicator({ left: btnRect.left - containerRect.left, width: btnRect.width });
    }, []);

    useLayoutEffect(() => {
        updateIndicator(activeKey);
    }, [activeKey, updateIndicator]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const ro = new ResizeObserver(() => updateIndicator(activeKey));
        ro.observe(container);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getTextColorFor = (opt: SwitcherOption<T>) => {
        const isUnderCapsule = activeKey === opt.value;
        if (!isUnderCapsule) return 'text-gray-600'; // tombol biasa, tak tersentuh capsule

        const optTextColor = opt.color?.split(' ').find((c) => c.startsWith('text-'));

        // capsule sedang putih (hover ke tombol lain, bukan yang selected)
        if (isCapsuleWhite) return optTextColor || 'text-gray-700';

        // capsule sedang gelap/berwarna (selected & tidak sedang di-hover ke tempat lain)
        return optTextColor || 'text-gray-700';
    };
    return (
        <div
            ref={containerRef}
            className={`relative inline-flex items-center gap-2 bg-gray-100 rounded-lg p-2 ${className}`}
            onMouseLeave={() => setHoveredKey(null)}
        >
            {indicator && (
                <div
                    className={`absolute shadow-sm top-1 bottom-1 rounded-lg transition-all duration-300 ease-out ${
                        isCapsuleWhite
                            ? 'bg-white'
                            : `${
                                  activeOption?.color?.split(' ').find((c) => c.startsWith('bg-')) ||
                                  defaultActiveClassName
                              } ring-1 ring-inset ${
                                  activeOption?.color?.split(' ').find((c) => c.startsWith('ring-')) ||
                                  'ring-gray-100'
                              }`
                    }`}
                    style={{ left: indicator.left, width: indicator.width }}
                />
            )}

            {options.map((opt) => (
                <button
                    key={opt.value}
                    ref={(el) => {
                        btnRefs.current[opt.value] = el;
                    }}
                    type="button"
                    onClick={() => onChange(opt)}
                    onMouseEnter={() => setHoveredKey(opt.value)}
                    className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-300 ${getTextColorFor(
                        opt
                    )}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
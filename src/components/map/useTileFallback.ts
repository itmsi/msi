import { useCallback, useRef, useState } from 'react';

const ERROR_THRESHOLD = 3;

export function useTileFallback(onFallback: () => void) {
    const [failed, setFailed] = useState(false);
    const errorCount = useRef(0);

    const handleTileError = useCallback(() => {
        errorCount.current += 1;
        if (errorCount.current >= ERROR_THRESHOLD && !failed) {
            setFailed(true);
            onFallback();
        }
    }, [failed, onFallback]);

    const reset = useCallback(() => {
        errorCount.current = 0;
        setFailed(false);
    }, []);

    return { handleTileError, failed, reset };
}
interface Props {
    onClick: () => void;
    position?: 'topright' | 'topleft';
}

export default function LocateButton({ onClick, position = 'topright' }: Props) {
    const style: React.CSSProperties = {
        position: 'absolute',
        top: 10,
        zIndex: 1000,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: 13,
        ...(position === 'topright' ? { right: 10 } : { left: 10 }),
    };

    return (
        <button type="button" onClick={onClick} style={style}>
            Gunakan Lokasi Saya
        </button>
    );
}
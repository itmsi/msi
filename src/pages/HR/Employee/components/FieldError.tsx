interface FieldErrorProps {
    message?: string;
}

// Matches the hint styling already used inside Input/TextArea, for fields (CustomSelect)
// that don't render their own error text.
export default function FieldError({ message }: FieldErrorProps) {
    if (!message) return null;
    return <p className="mt-1.5 text-xs text-error-500">{message}</p>;
}

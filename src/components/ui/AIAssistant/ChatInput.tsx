import { useState, KeyboardEvent } from 'react';
import Input from '@/components/form/input/InputField';
import { MdSend } from 'react-icons/md';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim() || isLoading) return;
        onSendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Ketik pesan Anda..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="!h-10"
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                        isLoading || !inputValue.trim()
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-[#0253a5] hover:bg-[#003061] text-white'
                    }`}
                    title="Send message"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <MdSend className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
}

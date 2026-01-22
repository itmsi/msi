import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { MdSend, MdMic, MdMicOff } from 'react-icons/md';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

// Check if browser supports Speech Recognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isVoiceSupported, setIsVoiceSupported] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);

    // Check voice support on mount
    useEffect(() => {
        if (SpeechRecognition) {
            setIsVoiceSupported(true);
            // Initialize recognition
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'id-ID'; // Bahasa Indonesia, fallback to 'en-US' if needed

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');

                setInputValue(transcript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            // Reset to minimum height first
            textareaRef.current.style.height = '40px';
            
            // Only expand if content needs more space
            const scrollHeight = textareaRef.current.scrollHeight;
            if (scrollHeight > 40) {
                textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
            }
        }
    }, [inputValue]);

    const handleSend = () => {
        if (!inputValue.trim() || isLoading) return;
        onSendMessage(inputValue);
        setInputValue('');
        
        // Reset to single line after sending
        if (textareaRef.current) {
            textareaRef.current.style.height = '40px';
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter without Shift = send message
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        // Shift + Enter = new line (default behavior, do nothing)
    };

    const toggleVoiceInput = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
            }
        }
    };

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        placeholder="Tanyakan apa saja..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || isListening}
                        rows={1}
                        className="w-full relative top-2 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        style={{ 
                            minHeight: '40px', 
                            maxHeight: '120px',
                            overflowY: inputValue.includes('\n') || (textareaRef.current?.scrollHeight || 0) > 40 ? 'auto' : 'hidden'
                        }}
                    />
                </div>

                {/* Voice Input Button */}
                {isVoiceSupported && (
                    <button
                        onClick={toggleVoiceInput}
                        disabled={isLoading}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                            isListening
                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isListening ? 'Stop recording' : 'Start voice input'}
                    >
                        {isListening ? (
                            <MdMicOff className="w-5 h-5" />
                        ) : (
                            <MdMic className="w-5 h-5" />
                        )}
                    </button>
                )}

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                        isLoading || !inputValue.trim()
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-[#0253a5] hover:bg-[#003061] text-white'
                    }`}
                    title="Send message (Enter)"
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

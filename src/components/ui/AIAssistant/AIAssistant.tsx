import { useState, useEffect, useRef } from 'react';
import { MdClose, MdSmartToy, MdDelete, MdMinimize } from 'react-icons/md';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

const SAMPLE_QUESTIONS = [
    "Tampilkan 5 quotation terbaru bulan ini dalam bentuk tabel",
    "Apa saja produk yang paling sering di-quote?",
    "Tampilkan summary quotation minggu ini",
];

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastMessageCountRef = useRef(0);
    const { messages, isLoading, sendMessage, clearMessages, messagesEndRef } = useAIAssistant();

    const handleToggle = () => {
        if (!isOpen) {
            setIsOpen(true);
            setIsMinimized(false);
        } else {
            setIsOpen(false);
            setIsMinimized(false);
        }
    };

    const handleMinimize = () => {
        if (!isMinimized) {
            // Minimizing
            setIsMinimized(true);
        } else {
            // Expanding - mark all as read
            setIsMinimized(false);
            setUnreadCount(0);
            lastMessageCountRef.current = messages.length;
        }
    };

    const handleClearChat = () => {
        setShowClearModal(true);
    };

    const confirmClearChat = () => {
        clearMessages();
        setShowClearModal(false);
        setUnreadCount(0);
        lastMessageCountRef.current = 0;
    };

    const handleSuggestionClick = (question: string) => {
        sendMessage(question);
    };

    // Track unread messages when minimized
    useEffect(() => {
        if (isMinimized && messages.length > lastMessageCountRef.current) {
            // New message received while minimized
            const newMessages = messages.length - lastMessageCountRef.current;
            setUnreadCount(prev => prev + newMessages);
        }
        
        if (!isMinimized && isOpen) {
            // Not minimized, update last count
            lastMessageCountRef.current = messages.length;
        }
    }, [messages, isMinimized, isOpen]);

    // Auto-scroll to bottom when chat is opened or expanded
    useEffect(() => {
        if (isOpen && !isMinimized && messagesEndRef.current) {
            // Instant scroll to bottom without animation
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [isOpen, isMinimized, messagesEndRef]);

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={handleToggle}
                    className="fixed bottom-6 left-6 z-[999999] flex items-center justify-center w-14 h-14 bg-[#0253a5] hover:bg-[#003061] text-white rounded-full shadow-theme-lg transition-all duration-300 hover:scale-110"
                    title="Open AI Assistant"
                >
                    <MdSmartToy className="w-7 h-7" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <>
                    {/* Minimized State */}
                    {isMinimized && (
                        <button
                            onClick={handleMinimize}
                            className="fixed bottom-6 left-6 z-[999999] flex items-center justify-center w-14 h-14 bg-[#0253a5] hover:bg-[#003061] text-white rounded-full shadow-theme-lg transition-all duration-300 hover:scale-110"
                            title="Expand AI Assistant"
                        >
                            <MdSmartToy className="w-7 h-7" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Full Chat Window */}
                    {!isMinimized && (
                <div className="fixed bottom-6 left-6 z-[999999] w-[400px] h-[600px] bg-white rounded-lg shadow-theme-xl border border-gray-200 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#0253a5] text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MdSmartToy className="w-6 h-6" />
                            <div>
                                <h3 className="font-primary-bold text-sm">AI Assistant</h3>
                                <p className="text-xs opacity-90">Tanyakan apapun tentang sistem</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <button
                                    onClick={handleClearChat}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Clear chat"
                                >
                                    <MdDelete className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={handleMinimize}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                title="Minimize"
                            >
                                <MdMinimize className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleToggle}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                title="Close"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full px-2">
                                <div className="text-center text-gray-400 mb-6">
                                    <MdSmartToy className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-secondary mb-1">
                                        Mulai percakapan dengan AI Assistant
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Atau pilih salah satu pertanyaan di bawah:
                                    </p>
                                </div>
                                
                                {/* Suggestion Cards */}
                                <div className="w-full space-y-2">
                                    {SAMPLE_QUESTIONS.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(question)}
                                            className="w-full text-left px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-[#0253a5] hover:text-white hover:border-[#0253a5] transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <span className="line-clamp-2">{question}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => (
                                    <ChatMessage key={index} message={message} />
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start mb-4">
                                        <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                                <span className="text-xs text-gray-500">AI sedang mengetik...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
                </div>
                    )}
                </>
            )}

            {/* Clear Chat Confirmation Modal */}
            <ConfirmationModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={confirmClearChat}
                title="Hapus Semua Pesan"
                message="Apakah Anda yakin ingin menghapus semua riwayat percakapan? Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                cancelText="Batal"
                type="warning"
            />
        </>
    );
}

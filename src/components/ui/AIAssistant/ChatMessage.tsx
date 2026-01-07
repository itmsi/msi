import { ChatMessage as ChatMessageType } from '@/types/aiAssistant';
import { formatTime } from '@/helpers/generalHelper';

interface ChatMessageProps {
    message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                <div
                    className={`rounded-lg px-4 py-2.5 ${
                        isUser
                            ? 'bg-[#0253a5] text-white'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap break-words font-secondary">
                        {message.content}
                    </p>
                </div>
                <div className={`mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    <span className="text-xs text-gray-400">
                        {formatTime(message.timestamp)}
                    </span>
                </div>
            </div>
        </div>
    );
}

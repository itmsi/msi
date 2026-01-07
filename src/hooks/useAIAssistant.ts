import { useState, useCallback, useRef, useEffect } from 'react';
import { AIAssistantService } from '@/services/aiAssistantService';
import { ChatMessage } from '@/types/aiAssistant';

export const useAIAssistant = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId] = useState(() => AIAssistantService.getOrCreateSessionId());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const sendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim()) return;

        // Add user message immediately
        const userMessage: ChatMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await AIAssistantService.sendMessage({
                message: messageText,
                sessionId
            });

            // Add assistant response
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.data.message,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Optionally merge conversation history from API
            // if (response.data.conversationHistory?.length > 0) {
            //     setMessages(response.data.conversationHistory);
            // }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
            setError(errorMessage);
            
            // Add error message as assistant response
            const errorChatMessage: ChatMessage = {
                role: 'assistant',
                content: `Maaf, terjadi kesalahan: ${errorMessage}`,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorChatMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
        AIAssistantService.clearSession();
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages,
        messagesEndRef,
        sessionId
    };
};

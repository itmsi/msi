import { useState, useCallback, useRef, useEffect } from 'react';
import { AIAssistantService } from '@/services/aiAssistantService';
import { ChatMessage } from '@/types/aiAssistant';

export const useAIAssistant = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
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
            // Send message without sessionId on first request, or with sessionId for subsequent requests
            const response = await AIAssistantService.sendMessage({
                message: messageText,
                sessionId: sessionId  // undefined on first request, backend will create
            });

            // Save sessionId from backend response for future requests
            if (response.data.sessionId && !sessionId) {
                setSessionId(response.data.sessionId);
            }

            // Add assistant response
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.data.message,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);
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

    const clearMessages = useCallback(async () => {
        try {
            // Only call API if we have a sessionId
            if (sessionId) {
                await AIAssistantService.clearHistory(sessionId);
            }
        } catch (err) {
            console.error('Failed to clear history on backend:', err);
            // Continue anyway to clear local state
        }
        
        // Clear local state
        setMessages([]);
        setError(null);
        setSessionId(undefined);  // Reset sessionId, next message will create new session
    }, [sessionId]);

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

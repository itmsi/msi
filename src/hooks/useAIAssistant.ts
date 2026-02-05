import { useState, useCallback, useRef, useEffect } from 'react';
import { AIAssistantService } from '@/services/aiAssistantService';
import { ChatMessage } from '@/types/aiAssistant';

const STORAGE_KEY_MESSAGES = 'ai_chat_messages';
const STORAGE_KEY_SESSION = 'ai_chat_session_id';

export const useAIAssistant = () => {
    // Load from sessionStorage on mount
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY_MESSAGES);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [sessionId, setSessionId] = useState<string | undefined>(() => {
        const stored = sessionStorage.getItem(STORAGE_KEY_SESSION);
        return stored || undefined;
    });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Persist messages to sessionStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
        }
    }, [messages]);

    // Persist sessionId to sessionStorage whenever it changes
    useEffect(() => {
        if (sessionId) {
            sessionStorage.setItem(STORAGE_KEY_SESSION, sessionId);
        }
    }, [sessionId]);

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
            // Get system from localStorage
            let systemArray: string[] = [];
            try {
                const storedSystem = localStorage.getItem('auth_system');
                systemArray = storedSystem ? JSON.parse(storedSystem) : [];
            } catch (e) {
                console.error('Failed to parse auth_system from localStorage:', e);
            }

            // Send message without sessionId on first request, or with sessionId for subsequent requests
            const response = await AIAssistantService.sendMessage({
                message: messageText,
                sessionId: sessionId,  // undefined on first request, backend will create
                system: systemArray
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
        
        // Clear local state and sessionStorage
        setMessages([]);
        setError(null);
        setSessionId(undefined);
        sessionStorage.removeItem(STORAGE_KEY_MESSAGES);
        sessionStorage.removeItem(STORAGE_KEY_SESSION);
        localStorage.removeItem('ai_chat_session_id');
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

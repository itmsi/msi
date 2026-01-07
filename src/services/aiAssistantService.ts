import { apiPost } from '@/helpers/apiHelper';
import { ChatRequest, ChatResponse } from '@/types/aiAssistant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class AIAssistantService {
    private static readonly ENDPOINT = `${API_BASE_URL}/mosa/ai-assistant/chat`;

    /**
     * Send message to AI assistant
     */
    static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
        try {
            const response = await apiPost<ChatResponse>(this.ENDPOINT, {
                message: request.message,
                sessionId: request.sessionId
            });

            // Validate response structure
            if (!response.data.success) {
                throw new Error(response.data.message || 'Chat processing failed');
            }

            if (!response.data.data || !response.data.data.message) {
                throw new Error('Invalid response format from server');
            }

            return response.data;
        } catch (error) {
            // Handle different types of errors
            if (error instanceof Error) {
                throw new Error(error.message);
            }

            // Handle API errors
            if (typeof error === 'object' && error !== null && 'message' in error) {
                throw new Error((error as any).message);
            }

            throw new Error('An unexpected error occurred while processing chat');
        }
    }

    /**
     * Generate a unique session ID
     */
    static generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get session ID from localStorage or create a new one
     */
    static getOrCreateSessionId(): string {
        const storedSessionId = localStorage.getItem('ai_chat_session_id');
        if (storedSessionId) {
            return storedSessionId;
        }

        const newSessionId = this.generateSessionId();
        localStorage.setItem('ai_chat_session_id', newSessionId);
        return newSessionId;
    }

    /**
     * Clear session ID from localStorage
     */
    static clearSession(): void {
        localStorage.removeItem('ai_chat_session_id');
    }
}

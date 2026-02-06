import { apiPost, apiGet, apiDelete } from '@/helpers/apiHelper';
import { 
    ChatRequest, 
    ChatResponse, 
    AiHistoryResponse, 
    AiClearHistoryResponse 
} from '@/types/aiAssistant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class AIAssistantService {
    private static readonly CHAT_ENDPOINT = `${API_BASE_URL}/mosa/ai-assistant/chat`;
    private static readonly HISTORY_ENDPOINT = `${API_BASE_URL}/mosa/ai-assistant/history`;

    /**
     * Send message to Mosa
     */
    static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
        try {
            // Build request body - only include sessionId and system if provided
            const requestBody: any = { message: request.message };
            if (request.sessionId) {
                requestBody.sessionId = request.sessionId;
            }
            if (request.system) {
                requestBody.system = request.system;
            }
            if (request.userId) {
                requestBody.userId = request.userId;
            }

            // Override timeout for AI endpoint (AI processing takes longer)
            const response = await apiPost<ChatResponse>(
                this.CHAT_ENDPOINT, 
                requestBody,
                { timeout: 60000 } // 60 seconds timeout for AI
            );

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
     * Get conversation history by session ID
     */
    static async getHistory(sessionId: string): Promise<AiHistoryResponse> {
        try {
            const endpoint = `${this.HISTORY_ENDPOINT}/${sessionId}`;
            const response = await apiGet<AiHistoryResponse>(endpoint);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to get conversation history');
            }

            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('An unexpected error occurred while getting history');
        }
    }

    /**
     * Clear conversation history by session ID
     */
    static async clearHistory(sessionId: string): Promise<AiClearHistoryResponse> {
        try {
            const endpoint = `${this.HISTORY_ENDPOINT}/${sessionId}`;
            const response = await apiDelete<AiClearHistoryResponse>(endpoint);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to clear conversation history');
            }

            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('An unexpected error occurred while clearing history');
        }
    }
}

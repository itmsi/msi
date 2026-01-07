export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface ChatRequest {
    message: string;
    sessionId: string;
}

export interface ChatResponseData {
    message: string;
    sessionId: string;
    conversationHistory: ChatMessage[];
}

export interface ChatResponse {
    success: boolean;
    message: string;
    data: ChatResponseData;
}

export interface ChatError {
    success: false;
    message: string;
}

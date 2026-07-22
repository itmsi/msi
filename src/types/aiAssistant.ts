export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface ChatRequest {
    message: string;
    sessionId?: string;  // Optional - backend will auto-create if not provided
    system?: string[];  // Optional - list of available systems
    userId?: string; // Optional - to identify user in backend
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

// History Response
export interface AiHistoryResponseData {
    sessionId: string;
    conversationHistory: ChatMessage[];
}

export interface AiHistoryResponse {
    success: boolean;
    message: string;
    data: AiHistoryResponseData;
}

// Clear History Response
export interface AiClearHistoryResponseData {
    sessionId: string;
}

export interface AiClearHistoryResponse {
    success: boolean;
    message: string;
    data: AiClearHistoryResponseData;
}

// History List by User
export interface AiHistorySessionItem {
    session_id: string;
    user_id: string;
    message_count: number;
    last_message_at: string;
    created_at: string;
    updated_at: string;
    first_message?: string; // First user message content for sidebar preview
}

export interface AiHistoryListResponseData {
    userId: string;
    total: number;
    conversations: AiHistorySessionItem[];
}

export interface AiHistoryListResponse {
    success: boolean;
    message: string;
    data: AiHistoryListResponseData;
}

// Error Response
export interface AiErrorResponse {
    success: false;
    message: string;
}

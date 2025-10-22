// API client for AI Interview Simulator
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Types based on the OpenAPI schema
export interface InterviewStartRequest {
  role: string;
  level?: string;
  questions?: number;
  candidate_profile?: string;
}

export interface AnswerRequest {
  answer: string;
}

export interface EvaluationModel {
  score: number;
  reasoning?: string;
  strengths?: string[];
  improvements?: string[];
  follow_up?: string | null;
}

export interface QARecordModel {
  question: string;
  answer: string;
  evaluation?: EvaluationModel | null;
}

export interface InterviewStepResponse {
  session_id: string;
  status: string;
  question?: string | null;
  question_index?: number | null;
  question_limit?: number | null;
  evaluation?: EvaluationModel | null;
  feedback?: string | null;
  qa_history: QARecordModel[];
  prompt?: string | null;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 422) {
          const errorData: HTTPValidationError = await response.json();
          throw new Error(`Validation Error: ${errorData.detail.map(e => e.msg).join(', ')}`);
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Start a new interview session
   */
  async startInterview(request: InterviewStartRequest): Promise<InterviewStepResponse> {
    return this.request<InterviewStepResponse>('/interviews', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Submit an answer for the current question
   */
  async submitAnswer(sessionId: string, answer: string): Promise<InterviewStepResponse> {
    return this.request<InterviewStepResponse>(`/interviews/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  /**
   * Get the current state of an interview session
   */
  async getSessionState(sessionId: string): Promise<InterviewStepResponse> {
    return this.request<InterviewStepResponse>(`/interviews/${sessionId}`);
  }

  /**
   * End an interview session
   */
  async endSession(sessionId: string): Promise<void> {
    return this.request<void>(`/interviews/${sessionId}`, {
      method: 'DELETE',
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing purposes
export { ApiClient };

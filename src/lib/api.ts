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
  time_taken?: number | null;
  time_expired?: boolean | null;
}

export interface EvaluationModel {
  score: number;
  overall_score?: number | null;
  technical_depth?: number | null;
  communication?: number | null;
  problem_solving?: number | null;
  reasoning?: string;
  strengths?: string[];
  improvements?: string[];
  follow_up?: string | null;
}

export interface QARecordModel {
  question: string;
  answer: string;
  evaluation?: EvaluationModel | null;
  follow_ups?: QARecordModel[] | null;
}

export interface InterviewStepResponse {
  session_id: string;
  status: string;
  question?: string | null;
  question_index?: number | null;
  question_limit?: number | null;
  question_difficulty?: string | null;
  question_time_limit?: number | null;
  time_elapsed?: number | null;
  time_remaining?: number | null;
  total_time_elapsed?: number | null;
  time_expired?: boolean | null;
  is_follow_up?: boolean | null;
  follow_up_count?: number | null;
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

export interface APIErrorResponse {
  detail: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'APIError';
  }
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
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        
        // Try to extract error message from response body
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            
            // Handle validation errors (422)
            if (response.status === 422) {
              const validationError = errorData as HTTPValidationError;
              if (validationError.detail && Array.isArray(validationError.detail)) {
                errorMessage = `Validation Error: ${validationError.detail.map(e => e.msg).join(', ')}`;
              } else {
                errorMessage = errorData.detail || errorMessage;
              }
            } 
            // Handle API errors with detail field
            else if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          }
        } catch (parseError) {
          // If we can't parse the error response, use the default message
          console.warn('Failed to parse error response:', parseError);
        }

        // Create specific error messages for common status codes
        if (response.status === 429) {
          errorMessage = this.getRateLimitErrorMessage(errorMessage);
        } else if (response.status === 502) {
          errorMessage = this.getAPIServiceErrorMessage(errorMessage);
        } else if (response.status === 404) {
          errorMessage = 'Session not found. Please start a new interview.';
        } else if (response.status === 409) {
          errorMessage = 'Interview already completed.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new APIError(errorMessage, response.status, response.statusText);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      // Re-throw APIError as-is
      if (error instanceof APIError) {
        console.error(`API request failed for ${endpoint}:`, error);
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`Network error for ${endpoint}:`, error);
        throw new APIError(
          'Network error. Please check your internet connection and try again.',
          0,
          'Network Error'
        );
      }
      
      // Re-throw other errors
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private getRateLimitErrorMessage(originalMessage: string): string {
    // Check if the message mentions OpenAI or quota
    if (originalMessage.toLowerCase().includes('openai') || 
        originalMessage.toLowerCase().includes('quota') ||
        originalMessage.toLowerCase().includes('rate limit')) {
      return 'API quota exceeded. Please check your OpenAI billing and quota settings. Please try again later.';
    }
    return 'Rate limit exceeded. Please try again in a few moments.';
  }

  private getAPIServiceErrorMessage(originalMessage: string): string {
    // Check if the message mentions OpenAI
    if (originalMessage.toLowerCase().includes('openai')) {
      return 'OpenAI API service error. Please try again later. If the issue persists, check OpenAI service status.';
    }
    return 'External API service error. Please try again later.';
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
  async submitAnswer(
    sessionId: string, 
    answer: string, 
    timeTaken?: number, 
    timeExpired?: boolean
  ): Promise<InterviewStepResponse> {
    const body: AnswerRequest = { answer };
    if (timeTaken !== undefined) body.time_taken = timeTaken;
    if (timeExpired !== undefined) body.time_expired = timeExpired;
    
    return this.request<InterviewStepResponse>(`/interviews/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(body),
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

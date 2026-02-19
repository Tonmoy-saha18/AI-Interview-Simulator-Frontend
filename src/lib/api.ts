// API client for AI Interview Simulator
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// --- Auth types ---

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
  role: 'candidate' | 'hr';
  organization_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  organization_id: string | null;
  organization_name: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  email?: string;
}

// --- Interview types ---

export type InterviewTypeValue = 'behavioral' | 'technical' | 'mixed' | 'coding_only';

export interface InterviewStartRequest {
  role: string;
  level?: string;
  questions?: number;
  candidate_profile?: string;
  interview_type?: InterviewTypeValue;
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

// --- Interview history & report types ---

export interface InterviewSessionListItem {
  session_id: string;
  role: string;
  level: string;
  interview_type: string;
  total_questions: number;
  status: string;
  overall_score?: number | null;
  started_at: string;
  completed_at?: string | null;
  total_time_seconds?: number | null;
}

export interface InterviewQuestionDetail {
  question_id: string;
  sequence_number: number;
  question_text: string;
  question_type?: string | null;
  difficulty?: string | null;
  answer_text?: string | null;
  score?: number | null;
  evaluation?: EvaluationModel | null;
  time_taken_seconds?: number | null;
  time_expired: boolean;
  follow_ups: InterviewQuestionDetail[];
}

export interface InterviewReportResponse {
  session_id: string;
  role: string;
  level: string;
  interview_type: string;
  total_questions: number;
  status: string;
  started_at: string;
  completed_at?: string | null;
  total_time_seconds?: number | null;
  overall_score?: number | null;
  technical_depth_score?: number | null;
  communication_score?: number | null;
  problem_solving_score?: number | null;
  summary_text?: string | null;
  strengths: string[];
  improvements: string[];
  questions: InterviewQuestionDetail[];
  qa_history: QARecordModel[];
}

// --- HR types ---

export interface InterviewLinkResponse {
  interview_id: string;
  token: string;
  interview_link: string;
  candidate_email: string;
  candidate_name?: string | null;
  role: string;
  level: string;
  expires_at: string;
  status: string;
}

export interface InterviewListItem {
  interview_id: string;
  candidate_email: string;
  candidate_name?: string | null;
  role: string;
  level: string;
  status: string;
  created_at: string;
  expires_at: string;
  used_at?: string | null;
  has_results: boolean;
}

export interface InterviewResultResponse {
  interview_id: string;
  candidate_email: string;
  candidate_name?: string | null;
  role: string;
  level: string;
  final_feedback?: string | null;
  overall_score?: string | null;
  qa_history: QARecordModel[];
  total_time_elapsed?: number | null;
  completed_at: string;
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
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (!skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
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

        // Auto-refresh on 401 (only once)
        if (response.status === 401 && !skipAuth && this.accessToken) {
          const newToken = await this.tryRefreshToken();
          if (newToken) {
            return this.request<T>(endpoint, options, true);
          }
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
    return this.request<InterviewStepResponse>('/api/v1/interviews', {
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
    
    return this.request<InterviewStepResponse>(`/api/v1/interviews/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get the current state of an interview session
   */
  async getSessionState(sessionId: string): Promise<InterviewStepResponse> {
    return this.request<InterviewStepResponse>(`/api/v1/interviews/${sessionId}/state`);
  }

  /**
   * End an interview session
   */
  async endSession(sessionId: string): Promise<void> {
    return this.request<void>(`/api/v1/interviews/${sessionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * List the current user's past interview sessions (auth required)
   */
  async listInterviews(): Promise<InterviewSessionListItem[]> {
    return this.request<InterviewSessionListItem[]>('/api/v1/interviews');
  }

  /**
   * Get a structured report for a completed interview (auth required)
   */
  async getInterviewReport(sessionId: string): Promise<InterviewReportResponse> {
    return this.request<InterviewReportResponse>(`/api/v1/interviews/${sessionId}/report`);
  }

  // --- HR endpoints ---

  /**
   * Create an interview from a CV upload (multipart form)
   */
  async createHRInterview(formData: FormData): Promise<InterviewLinkResponse> {
    const url = `${this.baseUrl}/hr/interviews/create`;
    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    const response = await fetch(url, { method: 'POST', body: formData, headers, credentials: 'include' });

    if (!response.ok) {
      let msg = `HTTP Error: ${response.status}`;
      try {
        const data = await response.json();
        msg = data.detail || msg;
      } catch { /* ignore */ }
      throw new APIError(msg, response.status, response.statusText);
    }
    return response.json();
  }

  /**
   * List all interviews created by an HR user
   */
  async listHRInterviews(hrEmail: string): Promise<InterviewListItem[]> {
    return this.request<InterviewListItem[]>(
      `/hr/interviews?hr_email=${encodeURIComponent(hrEmail)}`
    );
  }

  /**
   * Get interview details
   */
  async getHRInterview(interviewId: string, hrEmail: string): Promise<InterviewLinkResponse> {
    return this.request<InterviewLinkResponse>(
      `/hr/interviews/${interviewId}?hr_email=${encodeURIComponent(hrEmail)}`
    );
  }

  /**
   * Get interview results
   */
  async getHRInterviewResults(interviewId: string, hrEmail: string): Promise<InterviewResultResponse> {
    return this.request<InterviewResultResponse>(
      `/hr/interviews/${interviewId}/results?hr_email=${encodeURIComponent(hrEmail)}`
    );
  }

  /**
   * Access interview via secure token link (candidate)
   */
  async accessInterviewByToken(token: string): Promise<InterviewStepResponse> {
    return this.request<InterviewStepResponse>(`/api/v1/interview/${token}`);
  }

  // --- Auth endpoints ---

  async register(body: RegisterRequest): Promise<TokenResponse> {
    const res = await this.request<TokenResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);
    this.accessToken = res.access_token;
    return res;
  }

  async login(body: LoginRequest): Promise<TokenResponse> {
    const res = await this.request<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);
    this.accessToken = res.access_token;
    return res;
  }

  async refreshAccessToken(): Promise<TokenResponse> {
    const res = await this.request<TokenResponse>('/api/v1/auth/refresh', {
      method: 'POST',
    }, true);
    this.accessToken = res.access_token;
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request<Record<string, never>>('/api/v1/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.accessToken = null;
    }
  }

  async getProfile(): Promise<AuthUser> {
    return this.request<AuthUser>('/api/v1/auth/me');
  }

  async updateProfile(body: UpdateProfileRequest): Promise<AuthUser> {
    return this.request<AuthUser>('/api/v1/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  private async tryRefreshToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const res = await this.refreshAccessToken();
        return res.access_token;
      } catch {
        this.accessToken = null;
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing purposes
export { ApiClient };

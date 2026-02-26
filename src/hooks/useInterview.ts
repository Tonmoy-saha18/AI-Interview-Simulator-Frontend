import { useState, useCallback } from 'react';
import { apiClient, InterviewStepResponse, InterviewStartRequest, APIError, CodingProblemBrief, ComplexityAnalysisModel } from '@/lib/api';
import { toast } from 'sonner';

export interface InterviewState {
  sessionId: string | null;
  status: string | null;
  currentQuestion: string | null;
  questionIndex: number | null;
  questionLimit: number | null;
  questionDifficulty: string | null;
  questionTimeLimit: number | null;
  timeElapsed: number | null;
  timeRemaining: number | null;
  totalTimeElapsed: number | null;
  timeExpired: boolean | null;
  isFollowUp: boolean | null;
  followUpCount: number | null;
  evaluation: any | null;
  feedback: string | null;
  qaHistory: any[];
  prompt: string | null;
  isLoading: boolean;
  error: string | null;
  questionType: string | null;
  codingProblem: CodingProblemBrief | null;
  complexityAnalysis: ComplexityAnalysisModel | null;
}

export const useInterview = () => {
  const defaultState: InterviewState = {
    sessionId: null,
    status: null,
    currentQuestion: null,
    questionIndex: null,
    questionLimit: null,
    questionDifficulty: null,
    questionTimeLimit: null,
    timeElapsed: null,
    timeRemaining: null,
    totalTimeElapsed: null,
    timeExpired: null,
    isFollowUp: null,
    followUpCount: null,
    evaluation: null,
    feedback: null,
    qaHistory: [],
    prompt: null,
    isLoading: false,
    error: null,
    questionType: null,
    codingProblem: null,
    complexityAnalysis: null,
  };

  const [state, setState] = useState<InterviewState>(defaultState);

  const updateState = useCallback((response: InterviewStepResponse) => {
    setState(prev => ({
      ...prev,
      sessionId: response.session_id,
      status: response.status,
      currentQuestion: response.question || null,
      questionIndex: response.question_index || null,
      questionLimit: response.question_limit || null,
      questionDifficulty: response.question_difficulty || null,
      questionTimeLimit: response.question_time_limit || null,
      timeElapsed: response.time_elapsed || null,
      timeRemaining: response.time_remaining || null,
      totalTimeElapsed: response.total_time_elapsed || null,
      timeExpired: response.time_expired || null,
      isFollowUp: response.is_follow_up || null,
      followUpCount: response.follow_up_count || null,
      evaluation: response.evaluation || null,
      feedback: response.feedback || null,
      qaHistory: response.qa_history || [],
      prompt: response.prompt || null,
      isLoading: false,
      error: null,
      questionType: response.question_type || null,
      codingProblem: response.coding_problem || null,
      complexityAnalysis: response.complexity_analysis || null,
    }));
  }, []);

  // Method to initialize state with existing response data
  const initializeWithResponse = useCallback((response: InterviewStepResponse) => {
    console.log("Initializing interview state with response:", response);
    updateState(response);
  }, [updateState]);

  const startInterview = useCallback(async (request: InterviewStartRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.startInterview(request);
      updateState(response);
      toast.success('Interview started successfully!');
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      
      // Show appropriate toast based on error type
      if (error instanceof APIError) {
        if (error.status === 429) {
          toast.error('Rate Limit Exceeded', {
            description: errorMessage,
            duration: 5000,
          });
        } else if (error.status === 502) {
          toast.error('API Service Error', {
            description: errorMessage,
            duration: 5000,
          });
        } else {
          toast.error(errorMessage, { duration: 5000 });
        }
      } else {
        toast.error(errorMessage);
      }
      
      throw error;
    }
  }, [updateState]);

  const submitAnswer = useCallback(async (
    answer: string, 
    timeTaken?: number, 
    timeExpired?: boolean
  ) => {
    if (!state.sessionId) {
      throw new Error('No active session');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.submitAnswer(
        state.sessionId, 
        answer, 
        timeTaken, 
        timeExpired
      );
      updateState(response);
      
      if (response.status === 'completed') {
        toast.success('Interview completed!');
      } else {
        toast.success('Answer submitted successfully!');
      }
      
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to submit answer');
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      
      // Show appropriate toast based on error type
      if (error instanceof APIError) {
        if (error.status === 429) {
          toast.error('Rate Limit Exceeded', {
            description: errorMessage,
            duration: 5000,
          });
        } else if (error.status === 502) {
          toast.error('API Service Error', {
            description: errorMessage,
            duration: 5000,
          });
        } else if (error.status === 404) {
          toast.error('Session Not Found', {
            description: errorMessage,
            duration: 5000,
          });
        } else if (error.status === 409) {
          toast.error('Interview Completed', {
            description: errorMessage,
            duration: 5000,
          });
        } else {
          toast.error(errorMessage, { duration: 5000 });
        }
      } else {
        toast.error(errorMessage);
      }
      
      throw error;
    }
  }, [state.sessionId, updateState]);

  const getSessionState = useCallback(async (sessionId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.getSessionState(sessionId);
      updateState(response);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to get session state');
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      
      // Show appropriate toast based on error type
      if (error instanceof APIError) {
        if (error.status === 404) {
          toast.error('Session Not Found', {
            description: errorMessage,
            duration: 5000,
          });
        } else {
          toast.error(errorMessage, { duration: 5000 });
        }
      } else {
        toast.error(errorMessage);
      }
      
      throw error;
    }
  }, [updateState]);

  const endSession = useCallback(async () => {
    if (!state.sessionId) {
      return;
    }

    try {
      await apiClient.endSession(state.sessionId);
      setState(defaultState);
      toast.success('Session ended');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to end session');
      toast.error(errorMessage);
      console.error('Failed to end session:', error);
    }
  }, [state.sessionId]);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    ...state,
    startInterview,
    submitAnswer,
    getSessionState,
    endSession,
    reset,
    initializeWithResponse,
  };
};

// Helper function to extract error messages
function getErrorMessage(error: unknown, defaultMessage: string = 'An error occurred'): string {
  if (error instanceof APIError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

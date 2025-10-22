import { useState, useCallback } from 'react';
import { apiClient, InterviewStepResponse, InterviewStartRequest } from '@/lib/api';
import { toast } from 'sonner';

export interface InterviewState {
  sessionId: string | null;
  status: string | null;
  currentQuestion: string | null;
  questionIndex: number | null;
  questionLimit: number | null;
  evaluation: any | null;
  feedback: string | null;
  qaHistory: any[];
  prompt: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useInterview = () => {
  const [state, setState] = useState<InterviewState>({
    sessionId: null,
    status: null,
    currentQuestion: null,
    questionIndex: null,
    questionLimit: null,
    evaluation: null,
    feedback: null,
    qaHistory: [],
    prompt: null,
    isLoading: false,
    error: null,
  });

  const updateState = useCallback((response: InterviewStepResponse) => {
    console.log("Updating interview state with:", response);
    setState(prev => {
      const newState = {
        ...prev,
        sessionId: response.session_id,
        status: response.status,
        currentQuestion: response.question || null,
        questionIndex: response.question_index || null,
        questionLimit: response.question_limit || null,
        evaluation: response.evaluation || null,
        feedback: response.feedback || null,
        qaHistory: response.qa_history || [],
        prompt: response.prompt || null,
        isLoading: false,
        error: null,
      };
      console.log("New interview state:", newState);
      return newState;
    });
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to start interview';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  }, [updateState]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!state.sessionId) {
      throw new Error('No active session');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.submitAnswer(state.sessionId, answer);
      updateState(response);
      
      if (response.status === 'completed') {
        toast.success('Interview completed!');
      } else {
        toast.success('Answer submitted successfully!');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to get session state';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  }, [updateState]);

  const endSession = useCallback(async () => {
    if (!state.sessionId) {
      return;
    }

    try {
      await apiClient.endSession(state.sessionId);
      setState({
        sessionId: null,
        status: null,
        currentQuestion: null,
        questionIndex: null,
        questionLimit: null,
        evaluation: null,
        feedback: null,
        qaHistory: [],
        prompt: null,
        isLoading: false,
        error: null,
      });
      toast.success('Session ended');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end session';
      toast.error(errorMessage);
      console.error('Failed to end session:', error);
    }
  }, [state.sessionId]);

  const reset = useCallback(() => {
    setState({
      sessionId: null,
      status: null,
      currentQuestion: null,
      questionIndex: null,
      questionLimit: null,
      evaluation: null,
      feedback: null,
      qaHistory: [],
      prompt: null,
      isLoading: false,
      error: null,
    });
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

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Send, CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import VoiceRecorder from "@/components/VoiceRecorder";
import QuestionCard from "@/components/QuestionCard";
import { useInterview } from "@/hooks/useInterview";
import { APIError } from "@/lib/api";

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    sessionId, 
    status, 
    currentQuestion, 
    questionIndex, 
    questionLimit,
    questionDifficulty,
    questionTimeLimit,
    timeElapsed,
    timeRemaining,
    totalTimeElapsed,
    timeExpired,
    isFollowUp,
    followUpCount,
    evaluation, 
    feedback, 
    qaHistory, 
    isLoading, 
    error,
    submitAnswer,
    getSessionState,
    endSession,
    reset,
    initializeWithResponse
  } = useInterview();
  
  const { role, position, sessionId: locationSessionId, initialResponse } = location.state || {};
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number | null>(null);
  
  // Initialize timer when question changes
  useEffect(() => {
    if (questionTimeLimit !== null && currentQuestion && status === 'awaiting_answer') {
      // Start timer from timeRemaining if available (and > 0), otherwise from questionTimeLimit
      const initialTime = (timeRemaining !== null && timeRemaining > 0) ? timeRemaining : questionTimeLimit;
      setTimerSeconds(initialTime);
      setTimerExpired(initialTime <= 0);
      questionStartTimeRef.current = Date.now();
      
      // Clear any existing timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Only start countdown if time is remaining
      if (initialTime > 0) {
        timerIntervalRef.current = setInterval(() => {
          setTimerSeconds(prev => {
            if (prev === null || prev <= 0) {
              setTimerExpired(true);
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [currentQuestion, questionTimeLimit, timeRemaining, status]);


  useEffect(() => {
    if (!role || !position) {
      navigate("/");
      return;
    }

    console.log("Interview page mounted with:", { role, position, initialResponse, locationSessionId });

    // If we have an initial response from the Index page, initialize the state with it
    if (initialResponse) {
      console.log("Initializing with response:", initialResponse);
      initializeWithResponse(initialResponse);
      return;
    }

    // If we have a sessionId from location state, try to restore the session
    if (locationSessionId) {
      console.log("Restoring session:", locationSessionId);
      getSessionState(locationSessionId);
    }
  }, [role, position, navigate, initialResponse, locationSessionId, getSessionState, initializeWithResponse]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Calculate progress
  const progress = questionIndex !== null && questionLimit 
    ? (questionIndex / questionLimit) * 100 
    : 0;

  // Debug logging
  console.log("Interview page state:", {
    sessionId,
    status,
    currentQuestion,
    questionIndex,
    questionLimit,
    isLoading,
    error,
    progress
  });

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer before continuing");
      return;
    }

    // Calculate time taken
    const timeTaken = questionStartTimeRef.current 
      ? Math.floor((Date.now() - questionStartTimeRef.current) / 1000)
      : undefined;
    
    const expired = timerExpired || (timerSeconds !== null && timerSeconds <= 0);

    try {
      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      const response = await submitAnswer(currentAnswer, timeTaken, expired);
      setCurrentAnswer("");
      setTimerSeconds(null);
      setTimerExpired(false);

      // Check if interview is completed
      if (response.status === 'completed') {
        navigate("/feedback", { 
          state: { 
            sessionId: response.session_id,
            role, 
            position,
            finalResponse: response
          } 
        });
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error("Failed to submit answer:", error);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setCurrentAnswer(prev => prev + " " + transcript);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't end session on unmount as user might navigate back
      // Only reset local state
    };
  }, []);

  if (!role || !position) {
    return null;
  }

  if (error) {
    // Check if error contains APIError-like information
    const isRateLimitError = error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit');
    const isAPIServiceError = error.toLowerCase().includes('api service') || error.toLowerCase().includes('openai');
    const isNetworkError = error.toLowerCase().includes('network') || error.toLowerCase().includes('connection');

    return (
      <div className="min-h-screen bg-gradient-hero py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-gradient-card rounded-2xl p-8 border-2 border-destructive/30 shadow-glow">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {isRateLimitError ? 'Rate Limit Exceeded' : 
                 isAPIServiceError ? 'API Service Error' :
                 isNetworkError ? 'Network Error' :
                 'Error'}
              </h2>
              <p className="text-muted-foreground">{error}</p>
              
              {isRateLimitError && (
                <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground">
                    This usually means the OpenAI API quota has been exceeded. Please check your OpenAI billing and quota settings.
                  </p>
                </div>
              )}
              
              {isAPIServiceError && (
                <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground">
                    The external API service is experiencing issues. Please try again later.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
            >
              Back to Home
            </Button>
            {isRateLimitError || isAPIServiceError ? (
              <Button 
                onClick={() => window.location.reload()}
                variant="gradient"
              >
                Retry
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="animate-fade-in backdrop-blur-sm bg-card/50 rounded-2xl p-6 border border-primary/20 shadow-glow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{role}</h1>
              <p className="text-muted-foreground capitalize">{position} Position</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Question</div>
              <div className="text-2xl font-bold text-primary">
                {questionIndex !== null && questionLimit ? `${questionIndex}/${questionLimit}` : 'Loading...'}
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Timer Display */}
        {timerSeconds !== null && questionTimeLimit && (
          <div className="flex items-center justify-center gap-2">
            <Card className="px-4 py-2 bg-gradient-card border border-primary/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${timerSeconds <= 30 ? 'text-destructive animate-pulse' : 'text-primary'}`} />
                <span className={`font-mono text-lg font-bold ${
                  timerSeconds <= 30 ? 'text-destructive' : 
                  timerSeconds <= 60 ? 'text-accent' : 
                  'text-foreground'
                }`}>
                  {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </span>
                {timerExpired && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Time Expired
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard 
            question={currentQuestion} 
            questionNumber={questionIndex !== null ? questionIndex : 1}
            difficulty={questionDifficulty}
            isFollowUp={isFollowUp}
            followUpCount={followUpCount}
          />
        )}

        {/* Loading State */}
        {isLoading && !currentQuestion && (
          <div className="bg-gradient-card rounded-2xl shadow-glow p-8 text-center animate-fade-in border border-primary/20 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading interview...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Session ID: {sessionId || 'None'} | Status: {status || 'None'}
            </p>
          </div>
        )}

        {/* Debug Info - Remove this in production */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted/50 rounded-lg p-4 text-xs">
            <h4 className="font-bold mb-2">Debug Info:</h4>
            <p>Session ID: {sessionId || 'None'}</p>
            <p>Status: {status || 'None'}</p>
            <p>Current Question: {currentQuestion || 'None'}</p>
            <p>Question Index: {questionIndex !== null ? questionIndex : 'None'} (Display: {questionIndex !== null ? questionIndex : 'None'})</p>
            <p>Question Limit: {questionLimit !== null ? questionLimit : 'None'}</p>
            <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            <p>Initial Response: {initialResponse ? 'Present' : 'None'}</p>
            <div className="mt-2 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  if (initialResponse) {
                    initializeWithResponse(initialResponse);
                  } else if (locationSessionId) {
                    getSessionState(locationSessionId);
                  }
                }}
              >
                Refresh State
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  console.log("Current state:", { sessionId, status, currentQuestion, questionIndex, questionLimit, isLoading, error });
                  console.log("Location state:", { role, position, sessionId: locationSessionId, initialResponse });
                }}
              >
                Log State
              </Button>
            </div>
          </div>
        )} */}

        {/* Answer Input */}
        {currentQuestion && (
          <div className="bg-gradient-card rounded-2xl shadow-glow p-6 space-y-4 animate-fade-in border border-primary/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Your Answer
              </label>
              <VoiceRecorder 
                onTranscript={handleVoiceTranscript}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
            </div>
            
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here or use the microphone..."
              className="min-h-[200px] text-base resize-none"
              disabled={isRecording || isLoading}
            />

            <div className="flex justify-between items-center">
              {timerExpired && (
                <div className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Time has expired. You can still submit your answer.
                </div>
              )}
              <div className="ml-auto">
                <Button
                  onClick={handleSubmitAnswer}
                  size="lg"
                  variant="gradient"
                  disabled={isRecording || isLoading || !currentAnswer.trim()}
                >
                  {isLoading ? (
                    <>
                      Submitting... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : status === 'completed' || (questionIndex !== null && questionLimit && questionIndex >= questionLimit) ? (
                    <>
                      Complete Interview <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Submit Answer <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {questionLimit && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: questionLimit }, (_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  questionIndex !== null && index < questionIndex
                    ? "w-8 bg-success"
                    : questionIndex !== null && index === questionIndex
                    ? "w-12 bg-primary animate-pulse-glow"
                    : "w-6 bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;

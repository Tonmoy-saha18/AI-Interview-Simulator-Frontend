import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Mic, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import VoiceRecorder from "@/components/VoiceRecorder";
import QuestionCard from "@/components/QuestionCard";
import { useInterview } from "@/hooks/useInterview";

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    sessionId, 
    status, 
    currentQuestion, 
    questionIndex, 
    questionLimit, 
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

    try {
      const response = await submitAnswer(currentAnswer);
      setCurrentAnswer("");

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
    return (
      <div className="min-h-screen bg-gradient-hero py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>
            Back to Home
          </Button>
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

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard 
            question={currentQuestion} 
            questionNumber={questionIndex !== null ? questionIndex : 1}
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

            <div className="flex justify-end">
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

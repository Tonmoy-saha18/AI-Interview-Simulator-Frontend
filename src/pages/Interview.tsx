import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Mic, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import VoiceRecorder from "@/components/VoiceRecorder";
import QuestionCard from "@/components/QuestionCard";

// Mock questions - in production these would come from your Python Langraph backend
const mockQuestions = [
  "Tell me about yourself and your background in this field.",
  "What are your key strengths that make you suitable for this role?",
  "Describe a challenging project you've worked on and how you handled it.",
  "Where do you see yourself in five years?",
  "Why are you interested in this position at our company?",
];

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, position } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  useEffect(() => {
    if (!role || !position) {
      navigate("/");
    }
  }, [role, position, navigate]);

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer before continuing");
      return;
    }

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      toast.success("Answer saved!");
    } else {
      // Interview complete - navigate to feedback
      navigate("/feedback", { 
        state: { 
          role, 
          position, 
          answers: newAnswers,
          questions: mockQuestions 
        } 
      });
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setCurrentAnswer(prev => prev + " " + transcript);
  };

  if (!role || !position) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{role}</h1>
              <p className="text-muted-foreground">{position} Position</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Question</div>
              <div className="text-2xl font-bold text-primary">
                {currentQuestion + 1}/{mockQuestions.length}
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <QuestionCard 
          question={mockQuestions[currentQuestion]} 
          questionNumber={currentQuestion + 1}
        />

        {/* Answer Input */}
        <div className="bg-card rounded-xl shadow-soft p-6 space-y-4 animate-fade-in">
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
            disabled={isRecording}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleNextQuestion}
              size="lg"
              variant="gradient"
              disabled={isRecording}
            >
              {currentQuestion < mockQuestions.length - 1 ? (
                <>
                  Next Question <Send className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Complete Interview <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2">
          {mockQuestions.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index < currentQuestion
                  ? "w-8 bg-success"
                  : index === currentQuestion
                  ? "w-12 bg-primary animate-pulse-glow"
                  : "w-6 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Interview;

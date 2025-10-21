import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, Award, Home } from "lucide-react";

// Mock feedback - in production this would come from your Python Langraph evaluation
const mockFeedback = {
  overallScore: 85,
  strengths: [
    "Clear and concise communication",
    "Strong technical knowledge",
    "Good problem-solving approach",
  ],
  improvements: [
    "Could provide more specific examples",
    "Practice structuring answers using STAR method",
  ],
  detailedFeedback: [
    {
      question: "Tell me about yourself",
      score: 90,
      feedback: "Excellent introduction with relevant experience highlighted.",
    },
    {
      question: "Key strengths",
      score: 85,
      feedback: "Good self-awareness, but could link strengths more directly to role requirements.",
    },
    {
      question: "Challenging project",
      score: 80,
      feedback: "Clear problem description, but could elaborate more on the solution process.",
    },
  ],
};

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, position } = location.state || {};

  useEffect(() => {
    if (!role || !position) {
      navigate("/");
    }
  }, [role, position, navigate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  if (!role || !position) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-success to-success/60 mb-4 shadow-glow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Interview Complete!</h1>
          <p className="text-muted-foreground text-lg">
            {role} - {position}
          </p>
        </div>

        {/* Overall Score */}
        <Card className="p-10 text-center shadow-glow animate-fade-in bg-gradient-primary border-2 border-primary-glow/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-4 shadow-glow">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white text-xl font-semibold">Overall Performance</h2>
            <div className="text-7xl font-bold text-white drop-shadow-lg">
              {mockFeedback.overallScore}%
            </div>
            <p className="text-white/90 text-lg font-medium">Excellent performance!</p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border-2 border-success/30 backdrop-blur-sm hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/60 flex items-center justify-center shadow-glow">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {mockFeedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Areas for Improvement */}
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border-2 border-accent/30 backdrop-blur-sm hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-glow">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Areas to Improve</h3>
            </div>
            <ul className="space-y-3">
              {mockFeedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{improvement}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-foreground mb-6">Question-by-Question Analysis</h3>
          {mockFeedback.detailedFeedback.map((item, index) => (
            <Card key={index} className="p-7 shadow-glow animate-fade-in bg-gradient-card border border-primary/20 backdrop-blur-sm hover:scale-[1.02] transition-transform">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">
                    Q{index + 1}: {item.question}
                  </h4>
                  <p className="text-muted-foreground">{item.feedback}</p>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(item.score)}`}>
                  {item.score}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            onClick={() => navigate("/")}
            size="lg"
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            onClick={() => navigate("/interview", { state: { role, position } })}
            size="lg"
            variant="gradient"
          >
            Practice Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

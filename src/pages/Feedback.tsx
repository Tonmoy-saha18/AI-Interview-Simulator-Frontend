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
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Interview Complete!</h1>
          <p className="text-muted-foreground text-lg">
            {role} - {position}
          </p>
        </div>

        {/* Overall Score */}
        <Card className="p-8 text-center shadow-medium animate-fade-in bg-gradient-primary">
          <div className="space-y-2">
            <Award className="w-12 h-12 mx-auto text-white mb-4" />
            <h2 className="text-white text-lg font-medium">Overall Performance</h2>
            <div className="text-6xl font-bold text-white">
              {mockFeedback.overallScore}%
            </div>
            <p className="text-white/80">Excellent performance!</p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="p-6 shadow-soft animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="text-xl font-semibold text-foreground">Strengths</h3>
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
          <Card className="p-6 shadow-soft animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Areas to Improve</h3>
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
          <h3 className="text-2xl font-semibold text-foreground">Question-by-Question Analysis</h3>
          {mockFeedback.detailedFeedback.map((item, index) => (
            <Card key={index} className="p-6 shadow-soft animate-fade-in">
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

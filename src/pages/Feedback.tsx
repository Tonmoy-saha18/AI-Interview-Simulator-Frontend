import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Award, Home, Loader2 } from "lucide-react";
import { useInterview } from "@/hooks/useInterview";
import { InterviewStepResponse, EvaluationModel, QARecordModel } from "@/lib/api";

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, position, sessionId, finalResponse } = location.state || {};
  const { getSessionState, endSession, isLoading, error } = useInterview();
  const [feedbackData, setFeedbackData] = useState<InterviewStepResponse | null>(finalResponse || null);

  useEffect(() => {
    if (!role || !position) {
      navigate("/");
      return;
    }

    // If we don't have feedback data, try to get it from the session
    if (!feedbackData && sessionId) {
      getSessionState(sessionId).then((response) => {
        setFeedbackData(response);
      }).catch((error) => {
        console.error("Failed to get session state:", error);
      });
    }
  }, [role, position, navigate, sessionId, feedbackData, getSessionState]);

  // Calculate overall score from evaluations
  const calculateOverallScore = (qaHistory: QARecordModel[]): number => {
    if (!qaHistory.length) return 0;
    
    const scores = qaHistory 
      .map(qa => qa.evaluation?.overall_score ?? qa.evaluation?.score)
      .filter((score): score is number => score !== undefined && score !== null);
    
    if (!scores.length) return 0;
    
    return parseFloat(((scores.reduce((sum, score) => sum + score, 0) / (scores.length * 5)) * 100).toFixed(2));
  };

  // Calculate average scores by dimension
  const calculateAverageScores = (qaHistory: QARecordModel[]) => {
    const technicalScores: number[] = [];
    const communicationScores: number[] = [];
    const problemSolvingScores: number[] = [];
    
    qaHistory.forEach(qa => {
      if (qa.evaluation) {
        if (qa.evaluation.technical_depth !== null && qa.evaluation.technical_depth !== undefined) {
          technicalScores.push(qa.evaluation.technical_depth);
        }
        if (qa.evaluation.communication !== null && qa.evaluation.communication !== undefined) {
          communicationScores.push(qa.evaluation.communication);
        }
        if (qa.evaluation.problem_solving !== null && qa.evaluation.problem_solving !== undefined) {
          problemSolvingScores.push(qa.evaluation.problem_solving);
        }
      }
    });

    return {
      technical: technicalScores.length > 0 
        ? parseFloat((technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length).toFixed(2))
        : null,
      communication: communicationScores.length > 0
        ? parseFloat((communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length).toFixed(2))
        : null,
      problemSolving: problemSolvingScores.length > 0
        ? parseFloat((problemSolvingScores.reduce((a, b) => a + b, 0) / problemSolvingScores.length).toFixed(2))
        : null,
    };
  };

  // Extract strengths and improvements from evaluations
  const extractFeedback = (qaHistory: QARecordModel[]) => {
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    qaHistory.forEach(qa => {
      if (qa.evaluation) {
        if (qa.evaluation.strengths) {
          strengths.push(...qa.evaluation.strengths);
        }
        if (qa.evaluation.improvements) {
          improvements.push(...qa.evaluation.improvements);
        }
      }
    });
    
    return {
      strengths: [...new Set(strengths)], // Remove duplicates
      improvements: [...new Set(improvements)] // Remove duplicates
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

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

  if (isLoading || !feedbackData) {
    return (
      <div className="min-h-screen bg-gradient-hero py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    );
  }

  const overallScore = calculateOverallScore(feedbackData.qa_history);
  const averageScores = calculateAverageScores(feedbackData.qa_history);
  const { strengths, improvements } = extractFeedback(feedbackData.qa_history);

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
              {overallScore}%
            </div>
            <p className="text-white/90 text-lg font-medium">
              {overallScore >= 80 ? "Excellent performance!" : 
               overallScore >= 60 ? "Good performance!" : 
               "Keep practicing!"}
            </p>
          </div>
        </Card>

        {/* Multi-dimensional Scores */}
        {(averageScores.technical !== null || averageScores.communication !== null || averageScores.problemSolving !== null) && (
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border-2 border-primary/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Performance Breakdown</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {averageScores.technical !== null && (
                <div className="text-center p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="text-sm text-muted-foreground mb-2">Technical Depth</div>
                  <div className="text-4xl font-bold text-accent">{averageScores.technical}/5</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {((averageScores.technical / 5) * 100).toFixed(0)}% average
                  </div>
                </div>
              )}
              {averageScores.communication !== null && (
                <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="text-sm text-muted-foreground mb-2">Communication</div>
                  <div className="text-4xl font-bold text-success">{averageScores.communication}/5</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {((averageScores.communication / 5) * 100).toFixed(0)}% average
                  </div>
                </div>
              )}
              {averageScores.problemSolving !== null && (
                <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-2">Problem Solving</div>
                  <div className="text-4xl font-bold text-primary">{averageScores.problemSolving}/5</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {((averageScores.problemSolving / 5) * 100).toFixed(0)}% average
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

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
              {strengths.length > 0 ? (
                strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground italic">No specific strengths identified</li>
              )}
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
              {improvements.length > 0 ? (
                improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{improvement}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground italic">No specific improvements identified</li>
              )}
            </ul>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-foreground mb-6">Question-by-Question Analysis</h3>
          {feedbackData.qa_history.length > 0 ? (
            feedbackData.qa_history.map((qa, index) => (
              <Card key={index} className="p-7 shadow-glow animate-fade-in bg-gradient-card border border-primary/20 backdrop-blur-sm hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">
                      Q{index + 1}: {qa.question}
                    </h4>
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                      <p className="text-sm bg-muted/50 p-2 rounded border-l-2 border-primary">{qa.answer}</p>
                    </div>
                    {qa.evaluation && (
                      <div className="space-y-3">
                        {/* Multi-dimensional scores */}
                        {(qa.evaluation.overall_score !== null || qa.evaluation.technical_depth !== null || 
                          qa.evaluation.communication !== null || qa.evaluation.problem_solving !== null) && (
                          <div className="flex flex-wrap gap-3">
                            {(qa.evaluation.overall_score !== null && qa.evaluation.overall_score !== undefined) && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                Overall: {qa.evaluation.overall_score}/5
                              </Badge>
                            )}
                            {(qa.evaluation.technical_depth !== null && qa.evaluation.technical_depth !== undefined) && (
                              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                                Technical: {qa.evaluation.technical_depth}/5
                              </Badge>
                            )}
                            {(qa.evaluation.communication !== null && qa.evaluation.communication !== undefined) && (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                Communication: {qa.evaluation.communication}/5
                              </Badge>
                            )}
                            {(qa.evaluation.problem_solving !== null && qa.evaluation.problem_solving !== undefined) && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                Problem Solving: {qa.evaluation.problem_solving}/5
                              </Badge>
                            )}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Feedback:</p>
                          <p className="text-sm text-muted-foreground">{qa.evaluation.reasoning || "No specific feedback provided"}</p>
                        </div>
                        {qa.evaluation.follow_up && (
                          <div className="mt-2 p-2 bg-accent/10 rounded border-l-2 border-accent">
                            <p className="text-sm text-muted-foreground mb-1">Follow-up suggestion:</p>
                            <p className="text-sm">{qa.evaluation.follow_up}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {qa.evaluation && (
                    <div className={`text-3xl font-bold ${getScoreColor(qa.evaluation.overall_score ?? qa.evaluation.score ?? 0)}`}>
                      {qa.evaluation.overall_score ?? qa.evaluation.score ?? 'N/A'}
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border border-primary/20 backdrop-blur-sm">
              <p className="text-muted-foreground text-center">No question history available</p>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            onClick={() => {
              endSession();
              navigate("/");
            }}
            size="lg"
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            onClick={() => {
              endSession();
              navigate("/interview", { state: { role, position } });
            }}
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

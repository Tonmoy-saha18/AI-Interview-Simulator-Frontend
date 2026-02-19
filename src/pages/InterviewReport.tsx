import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  TrendingUp,
  Award,
  Home,
  Loader2,
  ArrowLeft,
  Clock,
  RotateCcw,
} from "lucide-react";
import { apiClient, InterviewReportResponse } from "@/lib/api";

const InterviewReport = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<InterviewReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setIsLoading(true);
    apiClient
      .getInterviewReport(sessionId)
      .then(setReport)
      .catch((err) => setError(err.message || "Failed to load report"))
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds == null) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-hero py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error || "Report not found"}</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Back button */}
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="animate-fade-in">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-success to-success/60 mb-4 shadow-glow">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Interview Report</h1>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-sm capitalize">{report.role}</Badge>
            <Badge variant="outline" className="text-sm capitalize">{report.level}</Badge>
            <Badge variant="outline" className="text-sm capitalize">
              {report.interview_type.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>
              {new Date(report.started_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDuration(report.total_time_seconds)}
            </span>
          </div>
        </div>

        {/* Overall Score */}
        {report.overall_score != null && (
          <Card className="p-10 text-center shadow-glow animate-fade-in bg-gradient-primary border-2 border-primary-glow/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-4 shadow-glow">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-white text-xl font-semibold">Overall Performance</h2>
              <div className="text-7xl font-bold text-white drop-shadow-lg">
                {report.overall_score}%
              </div>
              <p className="text-white/90 text-lg font-medium">
                {report.overall_score >= 80
                  ? "Excellent performance!"
                  : report.overall_score >= 60
                  ? "Good performance!"
                  : "Keep practicing!"}
              </p>
            </div>
          </Card>
        )}

        {/* Dimension Scores */}
        {(report.technical_depth_score != null ||
          report.communication_score != null ||
          report.problem_solving_score != null) && (
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border-2 border-primary/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Performance Breakdown
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {report.technical_depth_score != null && (
                <div className="text-center p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="text-sm text-muted-foreground mb-2">Technical Depth</div>
                  <div className="text-4xl font-bold text-accent">
                    {report.technical_depth_score}%
                  </div>
                </div>
              )}
              {report.communication_score != null && (
                <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="text-sm text-muted-foreground mb-2">Communication</div>
                  <div className="text-4xl font-bold text-success">
                    {report.communication_score}%
                  </div>
                </div>
              )}
              {report.problem_solving_score != null && (
                <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-2">Problem Solving</div>
                  <div className="text-4xl font-bold text-primary">
                    {report.problem_solving_score}%
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border-2 border-success/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/60 flex items-center justify-center shadow-glow">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {report.strengths.length > 0 ? (
                report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground italic">No specific strengths identified</li>
              )}
            </ul>
          </Card>

          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border-2 border-accent/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-glow">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Areas to Improve</h3>
            </div>
            <ul className="space-y-3">
              {report.improvements.length > 0 ? (
                report.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{imp}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground italic">No specific improvements identified</li>
              )}
            </ul>
          </Card>
        </div>

        {/* Summary */}
        {report.summary_text && (
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border border-primary/20 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">AI Summary</h3>
            <p className="text-muted-foreground whitespace-pre-line">{report.summary_text}</p>
          </Card>
        )}

        {/* Question Details */}
        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-foreground mb-6">Question-by-Question Analysis</h3>
          {report.questions.length > 0 ? (
            report.questions.map((q) => (
              <div key={q.question_id}>
                <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border border-primary/20 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-medium text-foreground">
                          Q{q.sequence_number}: {q.question_text}
                        </h4>
                        {q.difficulty && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {q.difficulty}
                          </Badge>
                        )}
                      </div>
                      {q.answer_text && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                          <p className="text-sm bg-muted/50 p-2 rounded border-l-2 border-primary">
                            {q.answer_text}
                          </p>
                        </div>
                      )}
                      {q.evaluation && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-3">
                            {q.evaluation.overall_score != null && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                Overall: {q.evaluation.overall_score}/5
                              </Badge>
                            )}
                            {q.evaluation.technical_depth != null && (
                              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                                Technical: {q.evaluation.technical_depth}/5
                              </Badge>
                            )}
                            {q.evaluation.communication != null && (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                Communication: {q.evaluation.communication}/5
                              </Badge>
                            )}
                            {q.evaluation.problem_solving != null && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                Problem Solving: {q.evaluation.problem_solving}/5
                              </Badge>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Feedback:</p>
                            <p className="text-sm text-muted-foreground">
                              {q.evaluation.reasoning || "No specific feedback provided"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {q.score != null && (
                      <div className={`text-3xl font-bold ${getScoreColor((q.score / 5) * 100)}`}>
                        {q.score}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Follow-ups */}
                {q.follow_ups.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {q.follow_ups.map((fu) => (
                      <div key={fu.question_id} className="ml-6 pl-4 border-l-2 border-accent/30">
                        <Card className="p-5 shadow-glow animate-fade-in bg-accent/5 border border-accent/20 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <RotateCcw className="w-4 h-4 text-accent flex-shrink-0" />
                            <h4 className="font-medium text-foreground text-sm">
                              Follow-up: {fu.question_text}
                            </h4>
                            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs">
                              Follow-up
                            </Badge>
                          </div>
                          {fu.answer_text && (
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground mb-1">Your Answer:</p>
                              <p className="text-sm bg-muted/50 p-2 rounded border-l-2 border-accent">
                                {fu.answer_text}
                              </p>
                            </div>
                          )}
                          {fu.evaluation && (
                            <p className="text-sm text-muted-foreground">
                              {fu.evaluation.reasoning || "No specific feedback provided"}
                            </p>
                          )}
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : report.qa_history.length > 0 ? (
            report.qa_history.map((qa, idx) => (
              <Card
                key={idx}
                className="p-7 shadow-glow animate-fade-in bg-gradient-card border border-primary/20 backdrop-blur-sm"
              >
                <h4 className="font-medium text-foreground mb-2">
                  Q{idx + 1}: {qa.question}
                </h4>
                <p className="text-sm bg-muted/50 p-2 rounded border-l-2 border-primary mb-3">
                  {qa.answer}
                </p>
                {qa.evaluation && (
                  <p className="text-sm text-muted-foreground">
                    {qa.evaluation.reasoning}
                  </p>
                )}
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
            onClick={() => navigate("/dashboard")}
            size="lg"
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate("/")}
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

export default InterviewReport;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Clock,
  User,
  Briefcase,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  apiClient,
  InterviewResultResponse,
  QARecordModel,
  EvaluationModel,
  APIError,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const HRResults = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hrEmail = user?.email || "";

  const [result, setResult] = useState<InterviewResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) {
      navigate("/hr");
      return;
    }
    (async () => {
      try {
        const data = await apiClient.getHRInterviewResults(interviewId);
        setResult(data);
      } catch (err) {
        const msg = err instanceof APIError ? err.message : "Failed to load results";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [interviewId, navigate]);

  const collectAllEvaluations = (qaHistory: QARecordModel[]): EvaluationModel[] => {
    const evals: EvaluationModel[] = [];
    const walk = (qa: QARecordModel) => {
      if (qa.evaluation) evals.push(qa.evaluation);
      qa.follow_ups?.forEach(walk);
    };
    qaHistory.forEach(walk);
    return evals;
  };

  const calcPercent = (qaHistory: QARecordModel[]): number => {
    const evals = collectAllEvaluations(qaHistory);
    const scores = evals
      .map((e) => e.overall_score ?? e.score)
      .filter((s): s is number => s != null);
    if (!scores.length) return 0;
    return parseFloat(((scores.reduce((a, b) => a + b, 0) / (scores.length * 5)) * 100).toFixed(1));
  };

  const calcDimensions = (qaHistory: QARecordModel[]) => {
    const evals = collectAllEvaluations(qaHistory);
    const avg = (vals: number[]) =>
      vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    return {
      technical: avg(evals.map((e) => e.technical_depth).filter((v): v is number => v != null)),
      communication: avg(evals.map((e) => e.communication).filter((v): v is number => v != null)),
      problemSolving: avg(evals.map((e) => e.problem_solving).filter((v): v is number => v != null)),
    };
  };

  const extractFeedback = (qaHistory: QARecordModel[]) => {
    const evals = collectAllEvaluations(qaHistory);
    return {
      strengths: [...new Set(evals.flatMap((e) => e.strengths || []))],
      improvements: [...new Set(evals.flatMap((e) => e.improvements || []))],
    };
  };

  const getScoreColor = (pct: number) =>
    pct >= 80 ? "text-success" : pct >= 60 ? "text-accent" : "text-destructive";

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const renderQA = (qa: QARecordModel, idx: number, isFollowUp = false, fuNum = 0) => (
    <div key={idx} className={isFollowUp ? "mt-4 ml-6 pl-4 border-l-2 border-accent/30" : ""}>
      <Card className={`p-6 bg-gradient-card border border-primary/20 backdrop-blur-sm ${isFollowUp ? "bg-accent/5" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isFollowUp && <RotateCcw className="w-4 h-4 text-accent flex-shrink-0" />}
              <h4 className={`font-medium text-foreground ${isFollowUp ? "text-sm" : ""}`}>
                {isFollowUp ? `Follow-up #${fuNum}: ${qa.question}` : `Q${idx}: ${qa.question}`}
              </h4>
              {isFollowUp && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs">
                  Follow-up
                </Badge>
              )}
            </div>
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-1">Candidate's Answer:</p>
              <p className="text-sm bg-muted/50 p-2 rounded border-l-2 border-primary">{qa.answer}</p>
            </div>
            {qa.evaluation && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {qa.evaluation.overall_score != null && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Overall: {qa.evaluation.overall_score}/5
                    </Badge>
                  )}
                  {qa.evaluation.technical_depth != null && (
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                      Technical: {qa.evaluation.technical_depth}/5
                    </Badge>
                  )}
                  {qa.evaluation.communication != null && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Communication: {qa.evaluation.communication}/5
                    </Badge>
                  )}
                  {qa.evaluation.problem_solving != null && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Problem Solving: {qa.evaluation.problem_solving}/5
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {qa.evaluation.reasoning || "No feedback"}
                </p>
              </div>
            )}
          </div>
          {qa.evaluation && (
            <div className={`text-3xl font-bold ${getScoreColor(((qa.evaluation.overall_score ?? qa.evaluation.score ?? 0) / 5) * 100)}`}>
              {qa.evaluation.overall_score ?? qa.evaluation.score ?? "N/A"}
            </div>
          )}
        </div>
      </Card>
      {qa.follow_ups?.map((fu, i) => renderQA(fu, i + 1, true, i + 1))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error || "No results found"}</p>
          <Button onClick={() => navigate("/hr")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const pct = calcPercent(result.qa_history);
  const dims = calcDimensions(result.qa_history);
  const { strengths, improvements } = extractFeedback(result.qa_history);

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-success/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Nav */}
        <Button variant="outline" onClick={() => navigate("/hr")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        {/* Candidate info */}
        <Card className="p-6 bg-gradient-card border border-primary/20 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Candidate:</span>
              <span className="font-medium">{result.candidate_name || result.candidate_email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Role:</span>
              <span className="font-medium">{result.role} ({result.level})</span>
            </div>
            {result.total_time_elapsed != null && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="font-medium">{formatTime(result.total_time_elapsed)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Completed:</span>
              <span className="font-medium">
                {new Date(result.completed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Score card */}
        <Card className="p-10 text-center shadow-glow animate-fade-in bg-gradient-primary border-2 border-primary-glow/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-4 shadow-glow">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white text-xl font-semibold">Overall Score</h2>
            <div className="text-7xl font-bold text-white drop-shadow-lg">{result.overall_score || `${pct}%`}</div>
            <p className="text-white/90 text-lg font-medium">
              {pct >= 80 ? "Excellent candidate!" : pct >= 60 ? "Good performance" : "Needs improvement"}
            </p>
          </div>
        </Card>

        {/* Dimensions */}
        {(dims.technical != null || dims.communication != null || dims.problemSolving != null) && (
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border-2 border-primary/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Performance Breakdown</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {dims.technical != null && (
                <div className="text-center p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="text-sm text-muted-foreground mb-2">Technical Depth</div>
                  <div className="text-4xl font-bold text-accent">{dims.technical}/5</div>
                </div>
              )}
              {dims.communication != null && (
                <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="text-sm text-muted-foreground mb-2">Communication</div>
                  <div className="text-4xl font-bold text-success">{dims.communication}/5</div>
                </div>
              )}
              {dims.problemSolving != null && (
                <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-2">Problem Solving</div>
                  <div className="text-4xl font-bold text-primary">{dims.problemSolving}/5</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Strengths / Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border-2 border-success/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/60 flex items-center justify-center shadow-glow">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {strengths.length > 0 ? strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{s}</span>
                </li>
              )) : (
                <li className="text-muted-foreground italic">None identified</li>
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
              {improvements.length > 0 ? improvements.map((im, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{im}</span>
                </li>
              )) : (
                <li className="text-muted-foreground italic">None identified</li>
              )}
            </ul>
          </Card>
        </div>

        {/* AI Summary */}
        {result.final_feedback && (
          <Card className="p-7 shadow-glow animate-fade-in bg-gradient-card border border-primary/20 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">AI Summary</h3>
            <p className="text-muted-foreground whitespace-pre-line">{result.final_feedback}</p>
          </Card>
        )}

        {/* Q&A */}
        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-foreground mb-6">Question-by-Question Analysis</h3>
          {result.qa_history.length > 0
            ? result.qa_history.map((qa, i) => renderQA(qa, i + 1))
            : (
              <Card className="p-7 bg-gradient-card border border-primary/20 text-center text-muted-foreground">
                No question history available
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default HRResults;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import CodeEditor from "./CodeEditor";
import { apiClient, CodingProblem, CodeRunResponse, TestCaseResult, APIError } from "@/lib/api";

interface CodingChallengeProps {
  problem: CodingProblem;
  sessionId: string;
  onSubmitComplete?: (result: CodeRunResponse) => void;
}

export default function CodingChallenge({
  problem,
  sessionId,
  onSubmitComplete,
}: CodingChallengeProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(problem.supported_languages[0] || "python");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<CodeRunResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<CodeRunResponse | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem(`code_${sessionId}_${problem.id}`);
    if (saved) {
      setCode(saved);
    } else {
      const sig = problem.function_signatures?.[language];
      setCode(sig || "");
    }
  }, [problem.id, sessionId, language]);

  useEffect(() => {
    if (code) {
      sessionStorage.setItem(`code_${sessionId}_${problem.id}`, code);
    }
  }, [code, sessionId, problem.id]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const result = await apiClient.runCode(sessionId, {
        code,
        language,
        problem_id: problem.id,
      });
      setRunResult(result);
    } catch (err) {
      const msg = err instanceof APIError ? err.message : "Failed to run code";
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const result = await apiClient.submitCode(sessionId, {
        code,
        language,
        problem_id: problem.id,
      });
      setSubmitResult(result);
      onSubmitComplete?.(result);
    } catch (err) {
      const msg = err instanceof APIError ? err.message : "Failed to submit code";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderTestResult = (tc: TestCaseResult, i: number) => (
    <div
      key={i}
      className={`p-3 rounded-lg border ${tc.passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {tc.passed ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <span className="text-sm font-medium">Test Case {i + 1}</span>
        <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
          <Clock className="h-3 w-3" /> {tc.execution_time_ms.toFixed(0)}ms
        </span>
        {tc.status === "TLE" && (
          <Badge variant="destructive" className="text-xs">TLE</Badge>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Input:</span>
          <pre className="mt-1 p-1.5 bg-muted/50 rounded text-foreground whitespace-pre-wrap">{tc.input}</pre>
        </div>
        <div>
          <span className="text-muted-foreground">Expected:</span>
          <pre className="mt-1 p-1.5 bg-muted/50 rounded text-foreground whitespace-pre-wrap">{tc.expected_output}</pre>
        </div>
        <div>
          <span className="text-muted-foreground">Actual:</span>
          <pre className={`mt-1 p-1.5 rounded whitespace-pre-wrap ${tc.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{tc.actual_output || "(empty)"}</pre>
        </div>
      </div>
      {tc.error && (
        <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          {tc.error}
        </div>
      )}
    </div>
  );

  const renderResultSummary = (result: CodeRunResponse) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-3">
      <div className="text-2xl font-bold">
        <span className={result.score >= 100 ? "text-success" : result.score >= 50 ? "text-yellow-600" : "text-destructive"}>
          {result.score.toFixed(0)}%
        </span>
      </div>
      <div className="text-sm">
        <span className="text-success">{result.passed_count} passed</span>
        {result.failed_count > 0 && <> / <span className="text-destructive">{result.failed_count} failed</span></>}
        {result.tle_count > 0 && <> / <span className="text-yellow-600">{result.tle_count} TLE</span></>}
        <span className="text-muted-foreground"> of {result.total_test_cases}</span>
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-4 h-full">
      {/* Left: Problem statement */}
      <div className="overflow-y-auto max-h-[80vh] space-y-4">
        <Card className="p-6 bg-gradient-card border border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-foreground">{problem.title}</h2>
            <Badge variant="outline" className={
              problem.difficulty === "easy"
                ? "bg-success/10 text-success border-success/30"
                : problem.difficulty === "hard"
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
            }>
              {problem.difficulty}
            </Badge>
          </div>
          <div className="prose prose-sm text-foreground max-w-none whitespace-pre-wrap">
            {problem.description_md}
          </div>
          {problem.constraints_md && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Constraints</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.constraints_md}</div>
            </div>
          )}
        </Card>

        {problem.sample_test_cases.length > 0 && (
          <Card className="p-4 bg-gradient-card border border-primary/20">
            <h4 className="text-sm font-semibold mb-3">Sample Test Cases</h4>
            {problem.sample_test_cases.map((tc, i) => (
              <div key={i} className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Input:</span>
                  <pre className="mt-1 p-2 bg-muted/50 rounded">{tc.input}</pre>
                </div>
                <div>
                  <span className="text-muted-foreground">Output:</span>
                  <pre className="mt-1 p-2 bg-muted/50 rounded">{tc.expected_output}</pre>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Hints */}
        {(problem.hint_1 || problem.hint_2 || problem.solution_skeleton) && (
          <Card className="p-4 bg-gradient-card border border-accent/20">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" /> Hints
            </h4>
            <div className="space-y-2">
              {problem.hint_1 && (
                <div>
                  {hintsRevealed >= 1 ? (
                    <p className="text-sm text-muted-foreground bg-accent/5 p-2 rounded">{problem.hint_1}</p>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setHintsRevealed(1)}>Reveal Hint 1</Button>
                  )}
                </div>
              )}
              {problem.hint_2 && (
                <div>
                  {hintsRevealed >= 2 ? (
                    <p className="text-sm text-muted-foreground bg-accent/5 p-2 rounded">{problem.hint_2}</p>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setHintsRevealed(2)} disabled={hintsRevealed < 1}>Reveal Hint 2</Button>
                  )}
                </div>
              )}
              {problem.solution_skeleton && (
                <div>
                  {hintsRevealed >= 3 ? (
                    <pre className="text-xs text-muted-foreground bg-accent/5 p-2 rounded whitespace-pre-wrap">{problem.solution_skeleton}</pre>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setHintsRevealed(3)} disabled={hintsRevealed < 2}>Reveal Solution Skeleton</Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Right: Editor + results */}
      <div className="flex flex-col gap-4 max-h-[80vh]">
        <div className="flex-1 min-h-0">
          <CodeEditor
            supportedLanguages={problem.supported_languages}
            functionSignatures={problem.function_signatures}
            value={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            height="100%"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRun} disabled={running || !code.trim()}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Run
          </Button>
          <Button variant="gradient" onClick={handleSubmit} disabled={submitting || !code.trim()}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit
          </Button>
        </div>

        {(runResult || submitResult) && (
          <Card className="p-4 bg-gradient-card border border-primary/20 overflow-y-auto max-h-[300px]">
            <Tabs defaultValue={submitResult ? "submit" : "run"}>
              <TabsList className="mb-3">
                {runResult && <TabsTrigger value="run">Run Results</TabsTrigger>}
                {submitResult && <TabsTrigger value="submit">Submit Results</TabsTrigger>}
              </TabsList>
              {runResult && (
                <TabsContent value="run">
                  {renderResultSummary(runResult)}
                  <div className="space-y-2">
                    {runResult.results.map((r, i) => renderTestResult(r, i))}
                  </div>
                </TabsContent>
              )}
              {submitResult && (
                <TabsContent value="submit">
                  {renderResultSummary(submitResult)}
                  <div className="space-y-2">
                    {submitResult.results.map((r, i) => renderTestResult(r, i))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
}

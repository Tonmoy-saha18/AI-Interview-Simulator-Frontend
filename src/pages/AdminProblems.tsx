import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Code,
  Home,
  Loader2,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient, CodingProblem, APIError } from "@/lib/api";

interface TestCaseInput {
  input: string;
  expected_output: string;
}

const difficulties = ["easy", "medium", "hard"];

const AdminProblems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionMd, setDescriptionMd] = useState("");
  const [constraintsMd, setConstraintsMd] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [topicTags, setTopicTags] = useState("");
  const [languages, setLanguages] = useState("python,javascript");
  const [timeLimitMs, setTimeLimitMs] = useState(2000);
  const [sampleCases, setSampleCases] = useState<TestCaseInput[]>([
    { input: "", expected_output: "" },
  ]);
  const [hiddenCases, setHiddenCases] = useState<TestCaseInput[]>([
    { input: "", expected_output: "" },
  ]);
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const list = await apiClient.listProblems();
      setProblems(list);
    } catch {
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescriptionMd("");
    setConstraintsMd("");
    setDifficulty("medium");
    setTopicTags("");
    setLanguages("python,javascript");
    setTimeLimitMs(2000);
    setSampleCases([{ input: "", expected_output: "" }]);
    setHiddenCases([{ input: "", expected_output: "" }]);
    setHint1("");
    setHint2("");
  };

  const handleCreate = async () => {
    if (!title || !slug || !descriptionMd) {
      toast.error("Title, slug, and description are required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title,
        slug,
        description_md: descriptionMd,
        constraints_md: constraintsMd || undefined,
        difficulty,
        topic_tags: topicTags.split(",").map((t) => t.trim()).filter(Boolean),
        supported_languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
        time_limit_ms: timeLimitMs,
        memory_limit_kb: 262144,
        sample_test_cases: sampleCases.filter((tc) => tc.input || tc.expected_output),
        hidden_test_cases: hiddenCases.filter((tc) => tc.input || tc.expected_output),
        hint_1: hint1 || undefined,
        hint_2: hint2 || undefined,
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/v1/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiClient.getAccessToken()}`,
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new APIError(data.detail || "Failed to create", res.status, res.statusText);
      }

      toast.success("Problem created");
      resetForm();
      setDialogOpen(false);
      loadProblems();
    } catch (err) {
      const msg = err instanceof APIError ? err.message : "Failed to create problem";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const addTestCase = (setter: React.Dispatch<React.SetStateAction<TestCaseInput[]>>) => {
    setter((prev) => [...prev, { input: "", expected_output: "" }]);
  };

  const updateTestCase = (
    setter: React.Dispatch<React.SetStateAction<TestCaseInput[]>>,
    index: number,
    field: keyof TestCaseInput,
    value: string,
  ) => {
    setter((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc))
    );
  };

  const removeTestCase = (
    setter: React.Dispatch<React.SetStateAction<TestCaseInput[]>>,
    index: number,
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const difficultyColors: Record<string, string> = {
    easy: "bg-success/10 text-success border-success/30",
    medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    hard: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10 max-w-5xl">
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Code className="w-6 h-6 text-white" />
              </div>
              Problem Bank
            </h1>
            <p className="text-muted-foreground mt-2">Manage coding problems for interviews</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient" onClick={() => { resetForm(); setDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> New Problem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Coding Problem</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title *</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Two Sum" />
                    </div>
                    <div>
                      <Label>Slug *</Label>
                      <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="two-sum" />
                    </div>
                  </div>
                  <div>
                    <Label>Description (Markdown) *</Label>
                    <Textarea value={descriptionMd} onChange={(e) => setDescriptionMd(e.target.value)} rows={6} placeholder="Given an array of integers..." />
                  </div>
                  <div>
                    <Label>Constraints (Markdown)</Label>
                    <Textarea value={constraintsMd} onChange={(e) => setConstraintsMd(e.target.value)} rows={3} placeholder="- 2 <= nums.length <= 10^4" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {difficulties.map((d) => (
                            <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Topics (comma-sep)</Label>
                      <Input value={topicTags} onChange={(e) => setTopicTags(e.target.value)} placeholder="array,hash-table" />
                    </div>
                    <div>
                      <Label>Time Limit (ms)</Label>
                      <Input type="number" value={timeLimitMs} onChange={(e) => setTimeLimitMs(Number(e.target.value))} />
                    </div>
                  </div>
                  <div>
                    <Label>Languages (comma-sep)</Label>
                    <Input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="python,javascript,java" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Sample Test Cases</Label>
                      <Button size="sm" variant="ghost" onClick={() => addTestCase(setSampleCases)}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    {sampleCases.map((tc, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                        <Input placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(setSampleCases, i, "input", e.target.value)} />
                        <Input placeholder="Expected Output" value={tc.expected_output} onChange={(e) => updateTestCase(setSampleCases, i, "expected_output", e.target.value)} />
                        <Button size="icon" variant="ghost" onClick={() => removeTestCase(setSampleCases, i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Hidden Test Cases</Label>
                      <Button size="sm" variant="ghost" onClick={() => addTestCase(setHiddenCases)}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                    {hiddenCases.map((tc, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                        <Input placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(setHiddenCases, i, "input", e.target.value)} />
                        <Input placeholder="Expected Output" value={tc.expected_output} onChange={(e) => updateTestCase(setHiddenCases, i, "expected_output", e.target.value)} />
                        <Button size="icon" variant="ghost" onClick={() => removeTestCase(setHiddenCases, i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hint 1</Label>
                      <Textarea value={hint1} onChange={(e) => setHint1(e.target.value)} rows={2} placeholder="Think about using a hash map..." />
                    </div>
                    <div>
                      <Label>Hint 2</Label>
                      <Textarea value={hint2} onChange={(e) => setHint2(e.target.value)} rows={2} placeholder="For each element, check if..." />
                    </div>
                  </div>

                  <Button onClick={handleCreate} className="w-full" variant="gradient" disabled={saving}>
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Create Problem</>}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => navigate("/")}>
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : problems.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-card border border-primary/20">
            <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No coding problems yet. Create the first one.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {problems.map((p) => (
              <Card key={p.id} className="p-5 bg-gradient-card border border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{p.title}</span>
                      <Badge variant="outline" className={difficultyColors[p.difficulty] || ""}>
                        {p.difficulty}
                      </Badge>
                      {p.topic_tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {p.slug} &bull; {p.supported_languages.join(", ")}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProblems;

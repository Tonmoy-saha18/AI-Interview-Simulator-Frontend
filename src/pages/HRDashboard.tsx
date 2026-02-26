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
  Upload,
  Users,
  FileText,
  Plus,
  Eye,
  Clock,
  CheckCircle2,
  Loader2,
  Home,
  Link as LinkIcon,
  Copy,
  Ban,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  apiClient,
  InterviewLinkResponse,
  InterviewListItem,
  APIError,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const levels = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "principal", label: "Principal" },
];

const interviewTypes = [
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "mixed", label: "Mixed" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  completed: "bg-success/10 text-success border-success/30",
  expired: "bg-destructive/10 text-destructive border-destructive/30",
  revoked: "bg-gray-500/10 text-gray-500 border-gray-500/30",
};

const HRDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hrEmail = user?.email || "";

  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("mid");
  const [questions, setQuestions] = useState(5);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [interviewType, setInterviewType] = useState("behavioral");
  const [notes, setNotes] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [createdLink, setCreatedLink] = useState<InterviewLinkResponse | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadInterviews();
  }, [statusFilter]);

  const loadInterviews = async () => {
    setIsLoadingList(true);
    try {
      const filter = statusFilter === "all" ? undefined : statusFilter;
      const list = await apiClient.listHRInterviews(filter);
      setInterviews(list);
    } catch (err) {
      if (err instanceof APIError && err.status !== 404) {
        toast.error("Failed to load interviews");
      }
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleCreate = async () => {
    if (!candidateEmail || !role || !cvFile) {
      toast.error("Please fill in all required fields and upload a CV");
      return;
    }

    setIsCreating(true);
    try {
      const form = new FormData();
      form.append("candidate_email", candidateEmail);
      if (candidateName) form.append("candidate_name", candidateName);
      form.append("role", role);
      form.append("level", level);
      form.append("questions", String(questions));
      form.append("expires_in_days", String(expiresInDays));
      form.append("interview_type", interviewType);
      if (notes) form.append("notes", notes);
      form.append("cv_file", cvFile);

      const res = await apiClient.createHRInterview(form);
      setCreatedLink(res);
      toast.success("Interview created & email sent!");

      setCandidateEmail("");
      setCandidateName("");
      setRole("");
      setCvFile(null);
      setNotes("");
      setShowForm(false);

      loadInterviews();
    } catch (err) {
      const msg = err instanceof APIError ? err.message : "Failed to create interview";
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (interviewId: string) => {
    try {
      await apiClient.patchHRInterview(interviewId, { revoke: true });
      toast.success("Interview link revoked");
      loadInterviews();
    } catch (err) {
      const msg = err instanceof APIError ? err.message : "Failed to revoke";
      toast.error(msg);
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10 max-w-5xl">
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Users className="w-6 h-6 text-white" />
              </div>
              HR Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Upload CVs, generate interview links, and track results</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" /> Home
          </Button>
        </div>

        <Card className="p-4 mb-6 bg-gradient-card border border-primary/20 backdrop-blur-sm animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{hrEmail}</span>
            {user?.organization_name && (
              <> &bull; <span className="font-medium text-foreground">{user.organization_name}</span></>
            )}
          </p>
        </Card>

        {createdLink && (
          <Card className="p-6 mb-6 border-2 border-success/40 bg-success/5 animate-fade-in">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">Interview Created Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  An invitation email was sent to <strong>{createdLink.candidate_email}</strong>.
                </p>
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                  <LinkIcon className="w-4 h-4 text-primary flex-shrink-0" />
                  <code className="text-sm flex-1 break-all">{createdLink.interview_link}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyLink(createdLink.interview_link)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expires: {formatDate(createdLink.expires_at)} &bull; Status: {createdLink.status}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setCreatedLink(null); setShowForm(true); }}>
                Create Another
              </Button>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gradient-card border border-primary/20 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Create Interview</h2>
              </div>

              {showForm && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Candidate Email *</Label>
                    <Input type="email" placeholder="candidate@example.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Candidate Name</Label>
                    <Input placeholder="John Doe" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Job Role *</Label>
                    <Input placeholder="e.g. Software Engineer" value={role} onChange={(e) => setRole(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Level</Label>
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {levels.map((l) => (
                            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Interview Type</Label>
                      <Select value={interviewType} onValueChange={setInterviewType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {interviewTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Questions</Label>
                      <Input type="number" min={1} max={10} value={questions} onChange={(e) => setQuestions(Number(e.target.value))} />
                    </div>
                    <div>
                      <Label className="text-sm">Link Expiry (days)</Label>
                      <Input type="number" min={1} max={90} value={expiresInDays} onChange={(e) => setExpiresInDays(Number(e.target.value))} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Notes (optional)</Label>
                    <Textarea placeholder="Internal notes about this interview..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                  </div>
                  <div>
                    <Label className="text-sm">Upload CV (PDF / DOCX) *</Label>
                    <div className="mt-1">
                      <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-primary/30 rounded-lg p-4 hover:border-primary/60 transition-colors">
                        <Upload className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {cvFile ? cvFile.name : "Click to select file"}
                        </span>
                        <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                  <Button onClick={handleCreate} className="w-full" variant="gradient" disabled={isCreating}>
                    {isCreating ? (
                      <>Creating... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                    ) : (
                      <>Create & Send Invite <FileText className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6 bg-gradient-card border border-primary/20 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Interviews
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="outline">{interviews.length} total</Badge>
                </div>
              </div>

              {isLoadingList ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No interviews yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {interviews.map((iv) => (
                    <Card key={iv.interview_id} className="p-4 border border-muted hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground truncate">
                              {iv.candidate_name || iv.candidate_email}
                            </span>
                            <Badge variant="outline" className={statusColors[iv.status] || ""}>
                              {iv.status.replace("_", " ")}
                            </Badge>
                            {iv.interview_type && (
                              <Badge variant="secondary" className="text-xs">
                                {iv.interview_type}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {iv.role} &bull; {iv.level}
                          </p>
                          {iv.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic truncate">
                              {iv.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDate(iv.created_at)}
                            </span>
                            {iv.used_at && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-success" /> Started {formatDate(iv.used_at)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {iv.has_results && (
                            <Button size="sm" variant="outline" onClick={() => navigate(`/hr/results/${iv.interview_id}`)}>
                              <Eye className="h-4 w-4 mr-1" /> Results
                            </Button>
                          )}
                          {(iv.status === "pending" || iv.status === "in_progress") && (
                            <Button size="sm" variant="destructive" className="text-xs" onClick={() => handleRevoke(iv.interview_id)}>
                              <Ban className="h-3 w-3 mr-1" /> Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;

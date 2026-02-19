import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  LogOut,
  Briefcase,
  Clock,
  User,
  Home,
  Loader2,
  BarChart3,
  Users,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient, InterviewSessionListItem } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [interviews, setInterviews] = useState<InterviewSessionListItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    apiClient
      .listInterviews()
      .then(setInterviews)
      .catch(() => {})
      .finally(() => setIsLoadingHistory(false));
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const roleBadgeColor: Record<string, string> = {
    candidate: "bg-primary/10 text-primary border-primary/30",
    hr: "bg-accent/10 text-accent border-accent/30",
    org_admin: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    platform_admin: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const statusColor: Record<string, string> = {
    completed: "bg-success/10 text-success border-success/30",
    in_progress: "bg-accent/10 text-accent border-accent/30",
    abandoned: "bg-muted text-muted-foreground border-muted",
    timed_out: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds == null) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.display_name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sign Out
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-8 bg-gradient-card border border-primary/20 backdrop-blur-sm animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">
                  {user?.display_name || "No name set"}
                </h2>
                <Badge
                  variant="outline"
                  className={roleBadgeColor[user?.role || "candidate"] || ""}
                >
                  {user?.role?.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
              {user?.organization_name && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {user.organization_name}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                <Clock className="w-3 h-3 inline mr-1" />
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-10 animate-fade-in">
          <Card
            className="p-6 border border-primary/20 bg-gradient-card backdrop-blur-sm hover:shadow-glow hover:scale-[1.02] transition-all cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  Start Practice Interview
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Practice with our AI interviewer and improve your skills
                </p>
              </div>
            </div>
          </Card>

          {(user?.role === "hr" || user?.role === "org_admin") && (
            <Card
              className="p-6 border border-accent/20 bg-gradient-card backdrop-blur-sm hover:shadow-glow hover:scale-[1.02] transition-all cursor-pointer group"
              onClick={() => navigate("/hr")}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    HR Dashboard
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload CVs, create interview links, and view results
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Interview History */}
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Interview History
        </h3>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Loading interviews...</span>
          </div>
        ) : interviews.length === 0 ? (
          <Card className="p-8 border border-muted bg-gradient-card backdrop-blur-sm text-center animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">No interviews yet</h4>
            <p className="text-sm text-muted-foreground">
              Your past interviews will appear here once you complete sessions
              while logged in.
            </p>
          </Card>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {interviews.map((interview) => (
              <Card
                key={interview.session_id}
                className="p-5 border border-primary/10 bg-gradient-card backdrop-blur-sm hover:border-primary/30 hover:shadow-glow transition-all cursor-pointer group"
                onClick={() =>
                  interview.status === "completed"
                    ? navigate(`/dashboard/report/${interview.session_id}`)
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="hidden sm:block">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">
                          {interview.role}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {interview.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {interview.interview_type.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColor[interview.status] || ""}`}
                        >
                          {interview.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>
                          {new Date(interview.started_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>{interview.total_questions} questions</span>
                        <span>{formatDuration(interview.total_time_seconds)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {interview.overall_score != null && (
                      <div
                        className={`text-2xl font-bold ${
                          interview.overall_score >= 80
                            ? "text-success"
                            : interview.overall_score >= 60
                            ? "text-accent"
                            : "text-destructive"
                        }`}
                      >
                        {interview.overall_score}%
                      </div>
                    )}
                    {interview.status === "completed" && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
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

export default Dashboard;

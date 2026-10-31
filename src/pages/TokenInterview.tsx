import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { apiClient, InterviewStepResponse, APIError } from "@/lib/api";

const TokenInterview = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No interview token provided.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const response: InterviewStepResponse = await apiClient.accessInterviewByToken(token);

        navigate("/interview", {
          state: {
            sessionId: response.session_id,
            role: "Interview",
            position: "candidate",
            initialResponse: response,
          },
        });
      } catch (err) {
        if (err instanceof APIError) {
          if (err.status === 410 || err.message.toLowerCase().includes("expired")) {
            setError("This interview link has expired. Please contact your recruiter for a new link.");
          } else if (err.status === 409 || err.message.toLowerCase().includes("completed")) {
            setError("This interview has already been completed.");
          } else if (err.status === 404) {
            setError("Invalid interview link. Please check the URL or contact your recruiter.");
          } else {
            setError(err.message);
          }
        } else {
          setError("Something went wrong. Please try again or contact your recruiter.");
        }
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>
        <Card className="p-10 text-center bg-gradient-card border border-primary/20 backdrop-blur-sm shadow-glow max-w-md w-full relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-6 shadow-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Preparing Your Interview</h2>
          <p className="text-muted-foreground mb-6">
            We're setting up your personalized interview session...
          </p>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse-glow" />
      </div>
      <Card className="p-10 text-center bg-gradient-card border-2 border-destructive/30 backdrop-blur-sm shadow-glow max-w-md w-full relative z-10">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Unable to Start Interview</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </Card>
    </div>
  );
};

export default TokenInterview;

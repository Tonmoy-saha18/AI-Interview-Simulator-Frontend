import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Briefcase, GraduationCap, Mic, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useInterview } from "@/hooks/useInterview";

const jobRoles = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "UX Designer",
  "Marketing Manager",
  "Sales Representative",
  "Business Analyst",
  "DevOps Engineer",
];

const positions = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "principal", label: "Principal" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
];

const Index = () => {
  const navigate = useNavigate();
  const { startInterview, isLoading } = useInterview();
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [questions, setQuestions] = useState(3);
  const [candidateProfile, setCandidateProfile] = useState("");

  const handleStartInterview = async () => {
    const role = customRole || selectedRole;
    
    if (!role || !selectedPosition) {
      toast.error("Please select both job role and position");
      return;
    }

    try {
      const response = await startInterview({
        role,
        level: selectedPosition,
        questions,
        candidate_profile: candidateProfile,
      });

      // Navigate to interview with session data
      navigate("/interview", { 
        state: { 
          sessionId: response.session_id,
          role, 
          position: selectedPosition,
          initialResponse: response
        } 
      });
    } catch (error) {
      // Error handling is done in the hook
      console.error("Failed to start interview:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-6 shadow-glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-accent">
              AI Interview Simulator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Practice your interview skills with our intelligent AI interviewer. 
              Get instant feedback and improve your performance.
            </p>
          </div>

          {/* Main Card */}
          <Card className="p-8 shadow-glow animate-fade-in bg-gradient-card border-2 border-primary/20 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Job Role Selection */}
                <div className="space-y-4">
                  <Label className="text-base flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Job Role
                  </Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job role" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Input
                    placeholder="Enter custom job role"
                    value={customRole}
                    onChange={(e) => {
                      setCustomRole(e.target.value);
                      setSelectedRole("");
                    }}
                  />
                </div>

                {/* Position Selection */}
                <div className="space-y-4">
                  <Label className="text-base flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Experience Level
                  </Label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.value} value={position.value}>
                          {position.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Number of Questions */}
                <div className="space-y-4">
                  <Label className="text-base">Number of Questions</Label>
                  <Select value={questions.toString()} onValueChange={(value) => setQuestions(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Question{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Candidate Profile */}
                <div className="space-y-4">
                  <Label className="text-base">Candidate Profile (Optional)</Label>
                  <Input
                    placeholder="Brief summary of your background..."
                    value={candidateProfile}
                    onChange={(e) => setCandidateProfile(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleStartInterview}
                size="lg"
                variant="gradient"
                className="w-full text-lg h-14"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    Starting Interview...
                    <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </>
                ) : (
                  <>
                    Start Interview
                    <Sparkles className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 text-center shadow-medium animate-fade-in hover:shadow-glow hover:scale-105 transition-all bg-gradient-card border border-primary/20 backdrop-blur-sm group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Voice & Text Input</h3>
              <p className="text-sm text-muted-foreground">
                Answer questions using your voice or by typing
              </p>
            </Card>

            <Card className="p-6 text-center shadow-medium animate-fade-in hover:shadow-glow hover:scale-105 transition-all bg-gradient-card border border-accent/20 backdrop-blur-sm group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">AI-Powered Evaluation</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent feedback on your responses
              </p>
            </Card>

            <Card className="p-6 text-center shadow-medium animate-fade-in hover:shadow-glow hover:scale-105 transition-all bg-gradient-card border border-success/20 backdrop-blur-sm group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success to-success/60 flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Detailed Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Receive comprehensive analysis and improvement tips
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

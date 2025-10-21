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
import { Sparkles, Briefcase, GraduationCap } from "lucide-react";
import { toast } from "sonner";

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
  "Entry Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Principal",
  "Manager",
  "Director",
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [customRole, setCustomRole] = useState("");

  const handleStartInterview = () => {
    const role = customRole || selectedRole;
    
    if (!role || !selectedPosition) {
      toast.error("Please select both job role and position");
      return;
    }

    navigate("/interview", { 
      state: { 
        role, 
        position: selectedPosition 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4">
              AI Interview Simulator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice your interview skills with our intelligent AI interviewer. 
              Get instant feedback and improve your performance.
            </p>
          </div>

          {/* Main Card */}
          <Card className="p-8 shadow-medium animate-fade-in">
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
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleStartInterview}
                size="lg"
                variant="gradient"
                className="w-full text-lg h-14"
              >
                Start Interview
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 text-center shadow-soft animate-fade-in hover:shadow-medium transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Voice & Text Input</h3>
              <p className="text-sm text-muted-foreground">
                Answer questions using your voice or by typing
              </p>
            </Card>

            <Card className="p-6 text-center shadow-soft animate-fade-in hover:shadow-medium transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI-Powered Evaluation</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent feedback on your responses
              </p>
            </Card>

            <Card className="p-6 text-center shadow-soft animate-fade-in hover:shadow-medium transition-all">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Detailed Feedback</h3>
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

// Missing import
import { Mic, TrendingUp } from "lucide-react";

export default Index;

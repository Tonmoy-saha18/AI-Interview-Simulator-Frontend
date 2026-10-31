import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, RotateCcw } from "lucide-react";

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  difficulty?: string | null;
  isFollowUp?: boolean | null;
  followUpCount?: number | null;
}

const QuestionCard = ({ 
  question, 
  questionNumber, 
  difficulty, 
  isFollowUp,
  followUpCount 
}: QuestionCardProps) => {
  const getDifficultyColor = (difficulty?: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-success/20 text-success border-success/30';
      case 'medium':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'hard':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <Card className="p-8 shadow-glow bg-gradient-card animate-fade-in border-2 border-primary/30 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="text-sm font-medium text-muted-foreground">
              {isFollowUp ? (
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-accent" />
                  Follow-up Question {followUpCount ? `#${followUpCount}` : ''}
                </span>
              ) : (
                `Question ${questionNumber}`
              )}
            </div>
            {difficulty && (
              <Badge 
                variant="outline" 
                className={`${getDifficultyColor(difficulty)} capitalize`}
              >
                {difficulty}
              </Badge>
            )}
            {isFollowUp && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                Follow-up
              </Badge>
            )}
          </div>
          <h2 className="text-2xl font-semibold text-foreground leading-relaxed">
            {question}
          </h2>
        </div>
      </div>
    </Card>
  );
};

export default QuestionCard;

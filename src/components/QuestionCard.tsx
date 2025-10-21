import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface QuestionCardProps {
  question: string;
  questionNumber: number;
}

const QuestionCard = ({ question, questionNumber }: QuestionCardProps) => {
  return (
    <Card className="p-8 shadow-glow bg-gradient-card animate-fade-in border-2 border-primary/30 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Question {questionNumber}
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

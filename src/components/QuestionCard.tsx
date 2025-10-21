import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface QuestionCardProps {
  question: string;
  questionNumber: number;
}

const QuestionCard = ({ question, questionNumber }: QuestionCardProps) => {
  return (
    <Card className="p-8 shadow-medium bg-card animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
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

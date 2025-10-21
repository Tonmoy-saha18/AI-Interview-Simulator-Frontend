import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder = ({ onTranscript, isRecording, setIsRecording }: VoiceRecorderProps) => {
  const [isSupported] = useState(() => 
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (event.results[event.results.length - 1].isFinal) {
          onTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error("Error with voice recognition. Please try again.");
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
      setIsRecording(true);
      toast.success("Listening...");
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error("Failed to start voice recording");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "secondary"}
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      className={isRecording ? "animate-pulse-glow" : ""}
    >
      {isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};

export default VoiceRecorder;

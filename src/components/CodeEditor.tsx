import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
  go: "go",
};

const DEFAULT_SNIPPETS: Record<string, string> = {
  python: '# Write your solution here\ndef solution():\n    pass\n',
  javascript: '// Write your solution here\nfunction solution() {\n  \n}\n',
  java: 'public class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    \n}\n',
};

interface CodeEditorProps {
  supportedLanguages: string[];
  functionSignatures?: Record<string, string> | null;
  value?: string;
  onChange?: (value: string) => void;
  onLanguageChange?: (lang: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({
  supportedLanguages,
  functionSignatures,
  value,
  onChange,
  onLanguageChange,
  language: controlledLang,
  readOnly = false,
  height = "400px",
}: CodeEditorProps) {
  const [internalLang, setInternalLang] = useState(supportedLanguages[0] || "python");
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");

  const language = controlledLang || internalLang;

  const handleLanguageChange = (lang: string) => {
    setInternalLang(lang);
    onLanguageChange?.(lang);
    if (!value) {
      const sig = functionSignatures?.[lang];
      onChange?.(sig || DEFAULT_SNIPPETS[lang] || "");
    }
  };

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {supportedLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
        >
          {theme === "vs-dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <Editor
        height={height}
        language={LANGUAGE_MAP[language] || language}
        theme={theme}
        value={value}
        onChange={(v) => onChange?.(v || "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "on",
        }}
      />
    </div>
  );
}

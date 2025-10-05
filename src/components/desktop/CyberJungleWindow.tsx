import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Code, Eye, Sparkles, Image, Video, Music } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CyberJungleWindowProps {
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CyberJungleWindow = ({ onClose }: CyberJungleWindowProps) => {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generationType, setGenerationType] = useState<'code' | 'image' | 'animation' | 'audio'>('code');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState("prompt");
  const { toast } = useToast();

  const generate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please describe what you want to build.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Handle image generation (non-streaming)
      if (generationType === 'image') {
        const { data, error } = await supabase.functions.invoke('cyber-jungle', {
          body: { 
            prompt,
            type: generationType,
          }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setGeneratedImage(data.content);
        setActiveTab("preview");
        toast({
          title: "Image Generated! 🎉",
          description: "Your image is ready in the Preview tab.",
        });
        setPrompt("");
        setIsGenerating(false);
        return;
      }

      // Handle code generation with streaming
      const projectId = 'qfnxzwxnuemecadfogbj';
      const functionUrl = `https://${projectId}.supabase.co/functions/v1/cyber-jungle`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbnh6d3hudWVtZWNhZGZvZ2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDc4MzEsImV4cCI6MjA2ODUyMzgzMX0.SeaAv2BwMGliVMPKsCBzyRJEcHYuuRLPKNuROWY0ouw'}`
        },
        body: JSON.stringify({
          prompt,
          type: generationType,
          conversation: conversation.length > 0 ? conversation : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let textBuffer = '';

      setGeneratedCode('');
      setActiveTab("code");

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              accumulatedContent += content;
              setGeneratedCode(accumulatedContent);
            }
          } catch (e) {
            // Incomplete JSON, will get completed in next chunk
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      const newConversation: Message[] = [
        ...conversation,
        { role: 'user', content: prompt },
        { role: 'assistant', content: accumulatedContent }
      ];
      
      setConversation(newConversation);
      
      toast({
        title: "Code Generated! 🎉",
        description: "Your component is ready in the Code tab.",
      });
      
      setPrompt("");
    } catch (error) {
      console.error('Error generating:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPreview = () => {
    if (!generatedCode) return null;

    // Extract code from markdown code blocks
    const codeMatch = generatedCode.match(/```(?:tsx|typescript|javascript|jsx)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1] : generatedCode;

    // Clean up the code - remove export default if it's there since we'll handle it
    const cleanCode = code
      .replace(/export\s+default\s+function\s+App/g, 'function App')
      .replace(/export\s+default\s+App/g, '');

    return (
      <iframe
        className="w-full h-full border-0 bg-background"
        sandbox="allow-scripts"
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script type="importmap">
                {
                  "imports": {
                    "react": "https://esm.sh/react@18.3.1",
                    "react-dom": "https://esm.sh/react-dom@18.3.1",
                    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
                    "react/": "https://esm.sh/react@18.3.1/"
                  }
                }
              </script>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                * { box-sizing: border-box; }
                body { 
                  margin: 0; 
                  padding: 0; 
                  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  overflow-x: hidden;
                }
                #root { min-height: 100vh; }
                .error-display {
                  padding: 20px;
                  margin: 20px;
                  background: #fee;
                  border: 2px solid #f00;
                  border-radius: 8px;
                  color: #c00;
                  font-family: monospace;
                  white-space: pre-wrap;
                }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="module">
                import React from 'react';
                import ReactDOM from 'react-dom/client';
                
                // Error boundary wrapper
                class ErrorBoundary extends React.Component {
                  constructor(props) {
                    super(props);
                    this.state = { hasError: false, error: null };
                  }
                  
                  static getDerivedStateFromError(error) {
                    return { hasError: true, error };
                  }
                  
                  render() {
                    if (this.state.hasError) {
                      return React.createElement('div', { className: 'error-display' },
                        'Runtime Error:\\n' + this.state.error.message
                      );
                    }
                    return this.props.children;
                  }
                }
                
                try {
                  ${cleanCode}
                  
                  if (typeof App === 'undefined') {
                    throw new Error('Component "App" not found. Make sure to export a function named App.');
                  }
                  
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  root.render(
                    React.createElement(ErrorBoundary, null,
                      React.createElement(App)
                    )
                  );
                } catch (error) {
                  console.error('Preview Error:', error);
                  document.getElementById('root').innerHTML = 
                    '<div class="error-display">Compilation Error:\\n' + error.message + '</div>';
                }
                
                // Capture runtime errors
                window.onerror = function(msg, url, line, col, error) {
                  const errorMsg = error ? error.stack : msg;
                  document.getElementById('root').innerHTML = 
                    '<div class="error-display">Runtime Error:\\n' + errorMsg + '</div>';
                  return true;
                };
              </script>
            </body>
          </html>
        `}
        title="Component Preview"
      />
    );
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="prompt" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Prompt
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2" disabled={generationType !== 'code'}>
              <Code className="w-4 h-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="flex-1 flex flex-col gap-4 p-4 mt-0">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Powered Creation Studio
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate code, images, animations, and audio with AI.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Generation Type</label>
              <Select value={generationType} onValueChange={(v: any) => setGenerationType(v)}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      React Component
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Image / Animation
                    </div>
                  </SelectItem>
                  <SelectItem value="audio" disabled>
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Audio (Coming Soon)
                    </div>
                  </SelectItem>
                  <SelectItem value="animation" disabled>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video (Coming Soon)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {conversation.length > 0 && generationType === 'code' && (
              <ScrollArea className="flex-1 border rounded-lg p-3 bg-muted/20">
                <div className="space-y-3">
                  {conversation.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50 border border-border'
                    }`}>
                      <div className="text-xs font-semibold mb-1 text-muted-foreground">
                        {msg.role === 'user' ? 'You' : 'Cyber Jungle'}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.role === 'user' ? msg.content : 'Generated code ✓'}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="space-y-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  generationType === 'code' 
                    ? "Example: Create a todo list app with add, delete, and mark as complete functionality."
                    : "Example: A futuristic cyber cityscape at sunset with neon lights"
                }
                className="min-h-[120px] resize-none bg-muted/30 border-border"
                disabled={isGenerating}
              />
              <Button 
                onClick={generate} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {generationType === 'code' ? 'Code' : 'Image'}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 mt-0">
            <ScrollArea className="h-full">
              <pre className="p-4 bg-muted/30 text-sm font-mono rounded-none">
                <code>{generatedCode || "// No code generated yet. Go to Prompt tab to start building!"}</code>
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 mt-0">
            {generatedImage ? (
              <div className="h-full flex items-center justify-center p-4 bg-muted/20">
                <img 
                  src={generatedImage} 
                  alt="Generated content" 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : generatedCode ? (
              renderPreview()
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <Eye className="w-12 h-12 mx-auto opacity-20" />
                  <p>No preview available yet.</p>
                  <p className="text-sm">Generate some content first!</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CyberJungleWindow;

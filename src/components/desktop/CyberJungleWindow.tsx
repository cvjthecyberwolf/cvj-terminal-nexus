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
      const { data, error } = await supabase.functions.invoke('cyber-jungle', {
        body: { 
          prompt,
          type: generationType,
          conversation: generationType === 'code' && conversation.length > 0 ? conversation : undefined
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.type === 'image') {
        setGeneratedImage(data.content);
        setActiveTab("preview");
        toast({
          title: "Image Generated! 🎉",
          description: "Your image is ready in the Preview tab.",
        });
      } else {
        const newConversation: Message[] = [
          ...conversation,
          { role: 'user', content: prompt },
          { role: 'assistant', content: data.content }
        ];
        
        setConversation(newConversation);
        setGeneratedCode(data.content);
        setActiveTab("code");
        
        toast({
          title: "Code Generated! 🎉",
          description: "Your component is ready in the Code tab.",
        });
      }
      
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

    return (
      <iframe
        className="w-full h-full border-0 bg-background"
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <script type="importmap">
                {
                  "imports": {
                    "react": "https://esm.sh/react@18.3.1",
                    "react-dom": "https://esm.sh/react-dom@18.3.1",
                    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client"
                  }
                }
              </script>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="module">
                import React from 'react';
                import ReactDOM from 'react-dom/client';
                
                try {
                  ${code}
                  
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  root.render(React.createElement(App || Component || (() => React.createElement('div', null, 'Component rendered successfully!'))));
                } catch (error) {
                  document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error: ' + error.message + '</div>';
                  console.error(error);
                }
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

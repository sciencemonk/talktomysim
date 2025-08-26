import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Check, Code, Smartphone, Monitor, FileCode } from 'lucide-react';
import { SimData } from '@/services/simService';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  sim: SimData | null;
}

const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose, sim }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('header');
  const [customWidth, setCustomWidth] = useState('400');
  const [customHeight, setCustomHeight] = useState('600');
  const [customColor, setCustomColor] = useState('#ffffff');

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!sim) {
    return null;
  }

  const getEmbedCode = (type: string) => {
    const baseUrl = 'https://talktomysim.com';
    const simId = sim.id;
    const simName = sim.name || 'AI Assistant';
    
    if (type === 'standard') {
      return `<iframe
  src="${baseUrl}/embed/${simId}"
  width="400"
  height="600"
  frameborder="0"
  allow="microphone"
  title="${simName} - AI Assistant"
></iframe>`;
    } else if (type === 'custom') {
      return `<iframe
  src="${baseUrl}/embed/${simId}?theme=${customColor.replace('#', '')}"
  width="${customWidth}"
  height="${customHeight}"
  frameborder="0"
  allow="microphone"
  title="${simName} - AI Assistant"
></iframe>`;
    } else if (type === 'popup') {
      return `<script>
  (function(w,d,s,o,f,js,fjs){
    w['${simName}Widget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','${simName.replace(/\s+/g, '')}Widget','${baseUrl}/embed/widget.js'));
  
  ${simName.replace(/\s+/g, '')}Widget('init', { id: '${simId}' });
</script>
<button onclick="${simName.replace(/\s+/g, '')}Widget('open')">Talk to My Sim</button>`;
    } else if (type === 'header') {
      const avatarUrl = sim.avatar_url || (sim.avatar ? `${baseUrl}/lovable-uploads/${sim.avatar}` : '');
      return `<script 
  src="${baseUrl}/embed/simple-widget.js" 
  data-sim-id="${simId}"
  data-position="bottom-right"
  data-color="${customColor}"
  data-avatar="${avatarUrl}"
></script>`;
    }
    
    return '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Embed Your Sim</DialogTitle>
          <DialogDescription>
            Add your AI Sim to your website with this embed code.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="header" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="header" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              <span>Header</span>
            </TabsTrigger>
            <TabsTrigger value="popup" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Popup</span>
            </TabsTrigger>
          </TabsList>





          <TabsContent value="popup" className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/30">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Popup embed adds a button to your site that opens your Sim in a popup window when clicked.
                </p>
              </div>
              
              <div className="relative">
                <Textarea
                  readOnly
                  value={getEmbedCode('popup')}
                  className="h-[200px] font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(getEmbedCode('popup'))}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="bg-background border rounded-md p-4 flex items-center justify-center">
                <Button>Talk to My Sim</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="header" className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/30">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Add this script to your HTML <code>&lt;head&gt;</code> section for the simplest integration. 
                  It automatically creates a chat button in the bottom-right corner of your website.
                </p>
              </div>
              
              <div className="relative">
                <Textarea
                  readOnly
                  value={getEmbedCode('header')}
                  className="h-[120px] font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(getEmbedCode('header'))}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="bg-background border rounded-md p-4">
                <div className="text-sm space-y-4">
                  <p>This script adds a floating chat button to your website that automatically positions itself in the bottom-right corner.</p>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden border" style={{ backgroundColor: customColor }}>
                        {sim.avatar_url || sim.avatar ? (
                          <img 
                            src={sim.avatar_url || (sim.avatar ? `/lovable-uploads/${sim.avatar}` : undefined)} 
                            alt={sim.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Profile Button</p>
                      </div>
                    </div>
                    <div className="border rounded p-2 text-xs bg-muted/50">
                      Bottom Right
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-md p-4 bg-muted/30">
              <h3 className="text-sm font-medium mb-2">Additional Options</h3>
              <p className="text-xs text-muted-foreground mb-3">
                You can customize the widget by adding these optional attributes to the script tag:
              </p>
              <div className="text-xs font-mono space-y-1">
                <p><span className="text-blue-500">data-position</span>="bottom-right" <span className="text-muted-foreground">// Position: bottom-right, bottom-left, top-right, top-left</span></p>
                <p><span className="text-blue-500">data-color</span>="#0072f5" <span className="text-muted-foreground">// Background color (visible if avatar fails to load)</span></p>
                <p><span className="text-blue-500">data-avatar</span>="https://example.com/avatar.png" <span className="text-muted-foreground">// Custom avatar URL (optional)</span></p>
                <p><span className="text-blue-500">data-width</span>="380" <span className="text-muted-foreground">// Chat window width in pixels</span></p>
                <p><span className="text-blue-500">data-height</span>="600" <span className="text-muted-foreground">// Chat window height in pixels</span></p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Need help? <a href="#" className="text-primary underline">View documentation</a>
          </div>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedModal;

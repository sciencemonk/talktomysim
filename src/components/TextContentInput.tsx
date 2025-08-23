
import React, { useState } from 'react';
import { Type, Save, X, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TextContentInputProps {
  onProcess: (title: string, content: string) => Promise<void>;
  isProcessing?: boolean;
}

export const TextContentInput: React.FC<TextContentInputProps> = ({ 
  onProcess, 
  isProcessing = false 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writingSample, setWritingSample] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const handleSave = async () => {
    const hasContent = title.trim() && content.trim();
    const hasWritingSample = writingSample.trim();
    
    if (!hasContent && !hasWritingSample) {
      return;
    }

    if (hasContent) {
      await onProcess(title.trim(), content.trim());
    }

    if (hasWritingSample) {
      await onProcess('Writing Sample - Voice & Style Analysis', writingSample.trim());
    }

    setTitle('');
    setContent('');
    setWritingSample('');
    setShowInput(false);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setWritingSample('');
    setShowInput(false);
  };

  if (!showInput) {
    return (
      <Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors" 
            onClick={() => setShowInput(true)}>
        <CardContent className="p-6 text-center">
          <Type className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h4 className="font-medium mb-2">Add Text Content</h4>
          <p className="text-sm text-muted-foreground">
            Add knowledge content or writing samples to capture your unique voice and style
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Add Text Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Knowledge Content
            </TabsTrigger>
            <TabsTrigger value="writing" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Writing Sample
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="content-title">Title</Label>
              <Input
                id="content-title"
                placeholder="e.g., Company Policies, Personal Experiences, Technical Documentation..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-text">Content</Label>
              <Textarea
                id="content-text"
                placeholder="Paste or type your content here. This could be documentation, personal experiences, methodologies, or any information you want your Sim to know about..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] resize-none"
                disabled={isProcessing}
              />
              <div className="text-xs text-muted-foreground text-right">
                {content.length.toLocaleString()} characters
              </div>
            </div>
          </TabsContent>

          <TabsContent value="writing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="writing-sample" className="text-base font-medium">
                Writing Sample
              </Label>
              <p className="text-sm text-muted-foreground">
                Paste examples of your writing - emails, messages, essays, or any text that represents how you communicate. 
                This helps your Sim learn your unique tone, style, tempo, and voice.
              </p>
            </div>

            <div className="space-y-2">
              <Textarea
                id="writing-sample"
                placeholder="Paste your writing samples here. Include emails you've sent, messages, blog posts, or any text that shows how you naturally communicate. The more varied the samples, the better your Sim will understand your voice.

Examples of good writing samples:
• Professional emails
• Casual messages to friends
• Social media posts
• Blog articles or essays
• Meeting notes or summaries
• Creative writing or personal reflections"
                value={writingSample}
                onChange={(e) => setWritingSample(e.target.value)}
                className="min-h-[300px] resize-none"
                disabled={isProcessing}
              />
              <div className="text-xs text-muted-foreground text-right">
                {writingSample.length.toLocaleString()} characters
              </div>
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Writing Sample Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Include both formal and informal writing styles</li>
                  <li>• Add examples of how you explain complex topics</li>
                  <li>• Include your typical greetings and sign-offs</li>
                  <li>• Show how you express emotions or enthusiasm</li>
                  <li>• Include examples of your humor or personality quirks</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            onClick={handleCancel} 
            variant="outline"
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={(!title.trim() || !content.trim()) && !writingSample.trim() || isProcessing}
          >
            <Save className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Save Content'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

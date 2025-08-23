
import React, { useState } from 'react';
import { Type, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TextContentInputProps {
  onSave: (title: string, content: string) => void;
  isProcessing?: boolean;
}

export const TextContentInput: React.FC<TextContentInputProps> = ({ 
  onSave, 
  isProcessing = false 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    await onSave(title.trim(), content.trim());
    setTitle('');
    setContent('');
    setShowInput(false);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
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
            Paste or type large amounts of text to add to your knowledge base
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

        <div className="flex justify-end gap-2">
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
            disabled={!title.trim() || !content.trim() || isProcessing}
          >
            <Save className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Save Content'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

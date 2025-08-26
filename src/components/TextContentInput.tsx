
import React, { useState } from 'react';
import { Save, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TextContentInputProps {
  onProcess?: (title: string, content: string) => Promise<void>;
  onProcessStart?: () => void;
  premiumRequired?: boolean;
}

export const TextContentInput: React.FC<TextContentInputProps> = ({ 
  onProcess,
  onProcessStart,
  premiumRequired = false
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || premiumRequired) {
      return;
    }

    const titleToProcess = title.trim();
    const contentToProcess = content.trim();
    
    // Clear form immediately
    setTitle('');
    setContent('');
    
    // Notify parent to refresh documents (shows document with "Processing" status)
    onProcessStart?.();
    
    // Start processing in background
    if (onProcess) {
      await onProcess(titleToProcess, contentToProcess);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content-title">Title</Label>
        <Input
          id="content-title"
          placeholder="e.g., Company Policies, Personal Experiences, Technical Documentation..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
        />
        <div className="text-xs text-muted-foreground text-right">
          {content.length.toLocaleString()} characters
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={!title.trim() || !content.trim()}
          variant={premiumRequired ? "secondary" : "default"}
        >
          {premiumRequired ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Premium Feature
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Content
            </>
          )}
        </Button>
      </div>
    </div>
  );
};


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createAdvisor, updateAdvisor } from '@/services/advisorService';
import { Advisor } from '@/pages/Admin';
import { toast } from '@/components/ui/use-toast';

interface AdvisorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advisor?: Advisor | null;
  onSuccess: () => void;
}

const AdvisorForm = ({ open, onOpenChange, advisor, onSuccess }: AdvisorFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    prompt: '',
    avatar_url: '',
    category: '',
    background_content: '',
    knowledge_summary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or advisor changes
  useEffect(() => {
    if (advisor) {
      setFormData({
        name: advisor.name || '',
        title: advisor.title || '',
        description: advisor.description || '',
        prompt: advisor.prompt || '',
        avatar_url: advisor.avatar_url || '',
        category: advisor.category || '',
        background_content: advisor.background_content || '',
        knowledge_summary: advisor.knowledge_summary || ''
      });
    } else {
      setFormData({
        name: '',
        title: '',
        description: '',
        prompt: '',
        avatar_url: '',
        category: '',
        background_content: '',
        knowledge_summary: ''
      });
    }
  }, [advisor, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.prompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and prompt are required fields"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (advisor) {
        await updateAdvisor(advisor.id, formData);
        toast({
          title: "Success",
          description: "Advisor updated successfully"
        });
      } else {
        await createAdvisor(formData);
        toast({
          title: "Success",
          description: "Advisor created successfully"
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save advisor:', error);
      toast({
        title: "Error",
        description: "Failed to save advisor"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{advisor ? 'Edit Advisor' : 'Create New Advisor'}</DialogTitle>
          <DialogDescription>
            {advisor ? 'Update the advisor information below.' : 'Fill in the details to create a new advisor.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Advisor name"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Professional title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the advisor"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Math, Science, Language"
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prompt">System Prompt *</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="The system prompt that defines how this advisor behaves"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="background_content">Background Content</Label>
            <Textarea
              id="background_content"
              value={formData.background_content}
              onChange={(e) => handleInputChange('background_content', e.target.value)}
              placeholder="Additional background information"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="knowledge_summary">Knowledge Summary</Label>
            <Textarea
              id="knowledge_summary"
              value={formData.knowledge_summary}
              onChange={(e) => handleInputChange('knowledge_summary', e.target.value)}
              placeholder="Summary of the advisor's knowledge areas"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : advisor ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisorForm;

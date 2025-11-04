import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface RequiredField {
  label: string;
  type: string;
  required: boolean;
}

interface AgentInfoCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  requiredInfo: RequiredField[];
  onSubmit: (collectedInfo: Record<string, string>) => void;
}

export function AgentInfoCollectionModal({
  isOpen,
  onClose,
  agentName,
  requiredInfo,
  onSubmit,
}: AgentInfoCollectionModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleInputChange = (fieldLabel: string, value: string) => {
    setFormData({ ...formData, [fieldLabel]: value });
  };

  const validateForm = (): boolean => {
    for (const field of requiredInfo) {
      if (field.required && !formData[field.label]?.trim()) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(formData);
  };

  const renderField = (field: RequiredField) => {
    const isTextarea = field.type === 'textarea' || field.type === 'long_text';
    
    return (
      <div key={field.label} className="space-y-2">
        <Label htmlFor={field.label}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {isTextarea ? (
          <Textarea
            id={field.label}
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={4}
            className="resize-none"
          />
        ) : (
          <Input
            id={field.label}
            type={field.type === 'email' ? 'email' : 'text'}
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Before we start...</DialogTitle>
          <DialogDescription>
            {agentName} would like to know a bit more to provide you with the best assistance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {requiredInfo.map(renderField)}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Start Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

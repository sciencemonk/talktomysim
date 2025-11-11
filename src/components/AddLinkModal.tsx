import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AddLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simId: string;
  linkToEdit?: {
    id: string;
    label: string;
    url: string;
  };
  onLinkSaved: () => void;
}

export const AddLinkModal = ({ open, onOpenChange, simId, linkToEdit, onLinkSaved }: AddLinkModalProps) => {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (linkToEdit) {
      setLabel(linkToEdit.label);
      setUrl(linkToEdit.url);
    } else {
      setLabel("");
      setUrl("");
    }
  }, [linkToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!label.trim() || !url.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both label and URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Fetch existing links
      const { data: sim, error: fetchError } = await supabase
        .from("sims")
        .select("social_links")
        .eq("id", simId)
        .single();

      if (fetchError) throw fetchError;

      const existingLinks = (sim.social_links as any[]) || [];
      let updatedLinks;

      if (linkToEdit) {
        // Update existing link
        updatedLinks = existingLinks.map((link: any) => 
          link.id === linkToEdit.id 
            ? { ...link, label: label.trim(), url: url.trim() }
            : link
        );
      } else {
        // Add new link
        const newLink = {
          id: crypto.randomUUID(),
          label: label.trim(),
          url: url.trim(),
        };
        updatedLinks = [...existingLinks, newLink];
      }

      // Update the sim with new links
      const { error: updateError } = await supabase
        .from("sims")
        .update({ social_links: updatedLinks })
        .eq("id", simId);

      if (updateError) throw updateError;

      toast({
        title: linkToEdit ? "Link updated" : "Link added",
        description: linkToEdit 
          ? "Your link has been updated successfully" 
          : "Your link has been added successfully",
      });

      onLinkSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving link:", error);
      toast({
        title: "Error",
        description: "Failed to save link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{linkToEdit ? "Edit Link" : "Add Link"}</DialogTitle>
          <DialogDescription>
            {linkToEdit 
              ? "Update your custom link details" 
              : "Add a custom link to display under your SIM description"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Website, Portfolio, LinkedIn"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {linkToEdit ? "Update Link" : "Add Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

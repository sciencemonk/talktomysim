import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Loader2, Trash2, InboxIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import ContactMessagesList from './ContactMessagesList';

interface ContactMeEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simId: string;
  editCode?: string;
}

const ContactMeEditModal = ({ open, onOpenChange, simId, editCode }: ContactMeEditModalProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('messages');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [inputEditCode, setInputEditCode] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load sim data
  useEffect(() => {
    if (open && simId) {
      loadSimData();
    }
  }, [open, simId]);

  const loadSimData = async () => {
    try {
      const { data: sim, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', simId)
        .single();

      if (error) throw error;

      if (sim) {
        setName(sim.name || '');
        setDescription(sim.description || '');
        setWelcomeMessage(sim.welcome_message || '');
        setAvatarPreview(sim.avatar_url || null);
      }
    } catch (error) {
      console.error('Error loading sim:', error);
      toast.error('Failed to load sim data');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const codeToUse = editCode || inputEditCode;
    
    if (!codeToUse || codeToUse.length !== 6) {
      toast.error('Please enter a valid 6-digit edit code');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a name for your sim');
      return;
    }

    if (name.trim().length > 50) {
      toast.error('Sim name must be 50 characters or less');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    setIsSaving(true);
    try {
      let avatarUrl = avatarPreview;

      // Upload avatar if new file provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${simId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = urlData.publicUrl;
      }
      
      // First verify the edit code matches
      const { data: verifyData, error: verifyError } = await supabase
        .from('advisors')
        .select('edit_code, name')
        .eq('id', simId)
        .maybeSingle();
      
      if (verifyError) {
        console.error('Error verifying edit code:', verifyError);
        toast.error('Failed to verify sim');
        return;
      }
      
      if (!verifyData) {
        toast.error('Sim not found');
        return;
      }
      
      if (verifyData.edit_code !== codeToUse && verifyData.edit_code?.trim() !== codeToUse?.trim()) {
        toast.error('Invalid edit code. Please check and try again.');
        return;
      }
      
      // Update sim with all fields
      const updateData = {
        name: name.trim(),
        description: description.trim(),
        welcome_message: welcomeMessage.trim() || `Thanks for reaching out! Fill out the form below and I'll get back to you.`,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };
      
      const { data: updateResult, error } = await supabase
        .from('advisors')
        .update(updateData)
        .eq('id', simId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      if (!updateResult || updateResult.length === 0) {
        toast.error('Update failed - please check your edit code');
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['user-sim'] });
      await queryClient.invalidateQueries({ queryKey: ['sim-conversations'] });
      await queryClient.invalidateQueries({ queryKey: ['advisors'] });
      await queryClient.invalidateQueries({ queryKey: ['public-agents'] });
      
      toast.success('Sim updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving sim:', error);
      toast.error('Failed to update sim');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('advisors')
        .delete()
        .eq('id', simId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['user-sim'] });
      await queryClient.invalidateQueries({ queryKey: ['user-sim-check'] });
      await queryClient.invalidateQueries({ queryKey: ['my-sim-conversations'] });
      
      toast.success('Sim deleted successfully');
      setShowDeleteDialog(false);
      onOpenChange(false);
      navigate('/directory');
    } catch (error) {
      console.error('Error deleting sim:', error);
      toast.error('Failed to delete sim');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Edit Contact Me Sim</h2>
              <p className="text-sm text-muted-foreground">
                Manage your contact form and view messages
              </p>
            </div>

            {/* Edit Code - Only show if not provided as prop */}
            {!editCode && (
              <div className="space-y-2">
                <Label htmlFor="editCode" className="text-sm font-medium">
                  Edit Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="editCode"
                  value={inputEditCode}
                  onChange={(e) => setInputEditCode(e.target.value)}
                  placeholder="Enter 6-digit edit code"
                  maxLength={6}
                  className="h-11 bg-background font-mono text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code that was provided when this sim was created
                </p>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="messages" className="gap-2">
                  <InboxIcon className="h-4 w-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="settings">
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="mt-6 space-y-4">
                <ContactMessagesList advisorId={simId} />
              </TabsContent>

              <TabsContent value="settings" className="mt-6 space-y-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                  {/* Sim Identity */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Sim Identity</h3>
                    
                    <div className="flex gap-6 items-start">
                      <div className="flex flex-col items-center gap-3">
                        <Avatar 
                          className="w-24 h-24 cursor-pointer border border-border/50 hover:border-border transition-colors" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {avatarPreview ? (
                            <AvatarImage src={avatarPreview} alt="Avatar preview" className="object-cover" />
                          ) : (
                            <AvatarFallback className="bg-muted/50">
                              <Upload className="w-6 h-6 text-muted-foreground/50" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <span className="text-xs text-muted-foreground">Click to upload</span>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Sim name"
                            maxLength={50}
                            required
                          />
                          <p className="text-xs text-muted-foreground">{name.length}/50 characters</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your contact form"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Welcome Message */}
                  <div className="space-y-2">
                    <Label htmlFor="welcome">Welcome Message</Label>
                    <Textarea
                      id="welcome"
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Message shown above the contact form"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isSaving || isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Sim
                    </Button>
                    <div className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sim?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your sim and all associated messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ContactMeEditModal;

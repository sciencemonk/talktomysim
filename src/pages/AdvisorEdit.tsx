
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Save, User, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { useRef } from 'react';

// Sample advisors data (same as in AdvisorSearchModal)
const SAMPLE_ADVISORS = [
  {
    id: "jobs",
    name: "Steve Jobs",
    role: "Entrepreneur",
    field: "Technology, Innovation",
    avatar: "/lovable-uploads/steve-jobs.jpg",
    description: "Co-founder of Apple Inc. Visionary entrepreneur who revolutionized personal computing, animated movies, music, phones, tablet computing, and digital publishing.",
    prompt: "You are Steve Jobs, the visionary co-founder of Apple. You think differently, push boundaries, and believe in creating products that are at the intersection of technology and liberal arts. You're passionate about design, simplicity, and creating magical user experiences."
  },
  {
    id: "musk",
    name: "Elon Musk",
    role: "Entrepreneur",
    field: "SpaceX, Tesla, Innovation",
    avatar: "/lovable-uploads/elon-musk.jpg",
    description: "CEO of SpaceX and Tesla. Entrepreneur focused on advancing sustainable transport and space exploration.",
    prompt: "You are Elon Musk, focused on accelerating the world's transition to sustainable energy and making life multiplanetary. You think from first principles, take calculated risks, and push the boundaries of what's possible."
  },
  // ... include all other advisors from the original array with default prompts
];

const AdvisorEdit = () => {
  const { advisorId } = useParams<{ advisorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [advisor, setAdvisor] = useState<any>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [field, setField] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Check authorization
  if (user?.email !== "michael@dexterlearning.com") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <User className="h-12 w-12 text-destructive" />
                <div>
                  <h3 className="font-semibold">Access Denied</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You don't have permission to edit advisors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (advisorId) {
      const foundAdvisor = SAMPLE_ADVISORS.find(a => a.id === advisorId);
      if (foundAdvisor) {
        setAdvisor(foundAdvisor);
        setName(foundAdvisor.name);
        setRole(foundAdvisor.role);
        setField(foundAdvisor.field);
        setDescription(foundAdvisor.description);
        setPrompt(foundAdvisor.prompt || '');
        setAvatar(foundAdvisor.avatar);
      }
    }
  }, [advisorId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Advisor updated",
        description: `${name} has been successfully updated.`
      });
      
      // In a real app, this would save to the database
      console.log('Saving advisor:', {
        id: advisorId,
        name,
        role,
        field,
        description,
        prompt,
        avatar
      });
      
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "There was an error updating the advisor.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAvatar(dataUrl);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Image uploaded",
        description: "Avatar has been updated successfully."
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!advisor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <User className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Advisor Not Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    The advisor you're looking for doesn't exist.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleBack} className="gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the advisor's basic details and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Advisor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., Entrepreneur, Investor"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="field">Field of Expertise</Label>
                  <Input
                    id="field"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="e.g., Technology, Innovation"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the advisor..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Prompt Configuration</CardTitle>
                <CardDescription>
                  Define how this advisor should behave and respond in conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="prompt">System Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="You are [Advisor Name], and you..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    This prompt defines the advisor's personality, knowledge, and how they should interact with users.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>
                  Upload or update the advisor's profile image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24 border-2 border-primary/30">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  How this advisor will appear to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{name || 'Advisor Name'}</h3>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {role || 'Role'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mb-1">{field || 'Field of Expertise'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {description || 'Advisor description...'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorEdit;

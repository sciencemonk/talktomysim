import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Plus, Upload, Camera, User, PenTool } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSim } from "@/hooks/useSim";
import { supabase } from "@/integrations/supabase/client";
import { promptGenerationService } from "@/services/promptGenerationService";
import { toast } from "sonner";

const BasicInfo = () => {
  const { sim, updateBasicInfo, checkCustomUrlAvailability, isLoading } = useSim();
  
  const [formData, setFormData] = useState({
    fullName: "",
    professionalTitle: "",
    dateOfBirth: undefined as Date | undefined,
    location: "",
    education: "",
    currentProfession: "",
    yearsExperience: "",
    areasOfExpertise: "",
    additionalBackground: "",
    writingSample: "",
    avatarUrl: "",
    customUrl: "",
    prompt: ""
  });

  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUrlAvailable, setIsUrlAvailable] = useState<boolean | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Memoize the generated prompt to prevent infinite re-renders
  const generatedPrompt = useMemo(() => {
    return sim ? promptGenerationService.generateSystemPrompt(sim) : null;
  }, [sim?.id, sim?.full_name, sim?.professional_title, sim?.areas_of_expertise, sim?.additional_background, sim?.writing_sample, sim?.interests, sim?.skills]);

  // Load existing sim data - only run when sim changes, not when generatedPrompt changes
  useEffect(() => {
    if (sim) {
      const newFormData = {
        fullName: sim.full_name || "",
        professionalTitle: sim.professional_title || "",
        dateOfBirth: sim.date_of_birth ? new Date(sim.date_of_birth) : undefined,
        location: sim.location || "",
        education: sim.education || "",
        currentProfession: sim.current_profession || "",
        yearsExperience: sim.years_experience?.toString() || "",
        areasOfExpertise: sim.areas_of_expertise || "",
        additionalBackground: sim.additional_background || "",
        writingSample: sim.writing_sample || "",
        avatarUrl: sim.avatar_url || "",
        customUrl: sim.custom_url || "",
        prompt: sim.prompt || generatedPrompt?.systemPrompt || ""
      };
      
      setFormData(newFormData);
      setInterests(sim.interests || []);
      setSkills(sim.skills || []);
      
      // Only set preview URL if there's a valid avatar URL (not a blob URL)
      if (sim.avatar_url && !sim.avatar_url.startsWith('blob:')) {
        setPreviewUrl(sim.avatar_url);
      } else {
        setPreviewUrl("");
      }
      
      // Reset unsaved changes when loading new data
      setHasUnsavedChanges(false);
    }
  }, [sim]); // Remove generatedPrompt from dependencies

  // Update prompt when generatedPrompt changes, but only if user hasn't set a custom prompt
  useEffect(() => {
    if (generatedPrompt?.systemPrompt && sim && !sim.prompt) {
      setFormData(prev => ({ ...prev, prompt: generatedPrompt.systemPrompt }));
    }
  }, [generatedPrompt?.systemPrompt, sim?.prompt]);

  // Track changes to form data and mark as having unsaved changes
  useEffect(() => {
    if (sim && formData.fullName !== "" && !isLoading) { // Only track after initial load
      const hasChanges = 
        formData.fullName !== (sim.full_name || "") ||
        formData.professionalTitle !== (sim.professional_title || "") ||
        formData.dateOfBirth?.toISOString().split('T')[0] !== sim.date_of_birth ||
        formData.location !== (sim.location || "") ||
        formData.education !== (sim.education || "") ||
        formData.currentProfession !== (sim.current_profession || "") ||
        formData.yearsExperience !== (sim.years_experience?.toString() || "") ||
        formData.areasOfExpertise !== (sim.areas_of_expertise || "") ||
        formData.additionalBackground !== (sim.additional_background || "") ||
        formData.writingSample !== (sim.writing_sample || "") ||
        formData.customUrl !== (sim.custom_url || "") ||
        formData.prompt !== (sim.prompt || "") ||
        JSON.stringify(interests) !== JSON.stringify(sim.interests || []) ||
        JSON.stringify(skills) !== JSON.stringify(sim.skills || []) ||
        selectedFile !== null;
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, interests, skills, selectedFile, sim, isLoading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return formData.avatarUrl;

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `sim-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File too large. Please select an image smaller than 5MB.");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file.");
        return;
      }

      setSelectedFile(file);
      // Create a blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      setPreviewUrl(blobUrl);
    }
  };

  const triggerFileUpload = () => {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData(prev => ({ ...prev, avatarUrl: "" }));
    // Clean up blob URL if it exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests(prev => [...prev, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(prev => prev.filter(i => i !== interest));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleCustomUrlChange = async (value: string) => {
    // Remove any leading slash and ensure it's URL-friendly
    const cleanUrl = value.toLowerCase()
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    handleInputChange('customUrl', cleanUrl);

    if (cleanUrl && cleanUrl !== sim?.custom_url) {
      setIsCheckingUrl(true);
      try {
        const available = await checkCustomUrlAvailability(cleanUrl);
        setIsUrlAvailable(available);
      } catch (error) {
        console.error('Error checking URL availability:', error);
        setIsUrlAvailable(null);
      } finally {
        setIsCheckingUrl(false);
      }
    } else {
      setIsUrlAvailable(null);
    }
  };

  const handleSave = async () => {
    try {
      let finalAvatarUrl = formData.avatarUrl;
      
      // Upload image if there's a selected file
      if (selectedFile) {
        finalAvatarUrl = await uploadImage() || "";
      }

      const basicInfoData = {
        full_name: formData.fullName,
        professional_title: formData.professionalTitle,
        date_of_birth: formData.dateOfBirth?.toISOString().split('T')[0],
        location: formData.location,
        education: formData.education,
        current_profession: formData.currentProfession,
        years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : undefined,
        areas_of_expertise: formData.areasOfExpertise,
        additional_background: formData.additionalBackground,
        writing_sample: formData.writingSample,
        custom_url: formData.customUrl,
        avatar_url: finalAvatarUrl,
        interests,
        skills,
        prompt: formData.prompt,
        // Use full name as the display name if provided
        name: formData.fullName || 'My Sim',
        title: formData.professionalTitle,
        description: formData.areasOfExpertise || formData.additionalBackground || 'Personal AI assistant'
      };

      await updateBasicInfo(basicInfoData);
      
      // Update local state with the final avatar URL
      if (finalAvatarUrl !== formData.avatarUrl) {
        setFormData(prev => ({ ...prev, avatarUrl: finalAvatarUrl }));
        // Clean up blob URL and update with permanent URL
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(finalAvatarUrl);
        setSelectedFile(null);
      }
      
      // Mark as saved
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving basic info:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Context Window
            </CardTitle>
            <Button 
              onClick={handleSave} 
              variant={hasUnsavedChanges ? "default" : "outline"}
              className={cn(
                "relative",
                hasUnsavedChanges && "pr-6"
              )}
              disabled={isLoading || isUploading || (formData.customUrl && isUrlAvailable === false)}
            >
              {isLoading || isUploading ? 'Saving...' : 'Save'}
              {hasUnsavedChanges && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Picture</h3>
            <div className="space-y-3">
              <div 
                className="relative inline-block cursor-pointer group"
                onClick={triggerFileUpload}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-border group-hover:opacity-80 transition-opacity"
                      onError={(e) => {
                        console.error('Avatar image failed to load:', previewUrl);
                        // If image fails to load, show the upload placeholder
                        setPreviewUrl("");
                      }}
                    />
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center group-hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-muted-foreground/80" />
                  </div>
                )}
              </div>
              
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Click the circle to upload an image. Max file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>

          {/* Custom URL */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom URL</h3>
            <div className="space-y-2">
              <Label htmlFor="customUrl">Your Custom Path</Label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-1">/</span>
                <Input
                  id="customUrl"
                  value={formData.customUrl}
                  onChange={(e) => handleCustomUrlChange(e.target.value)}
                  placeholder="your-name"
                  className="flex-1"
                />
                {isCheckingUrl && <span className="ml-2 text-sm text-muted-foreground">Checking...</span>}
              </div>
              {isUrlAvailable === false && (
                <p className="text-xs text-destructive">This URL is already taken</p>
              )}
              {isUrlAvailable === true && (
                <p className="text-xs text-green-600">This URL is available</p>
              )}
              <p className="text-xs text-muted-foreground">
                This will be your personal URL path. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalTitle">Professional Title</Label>
                <Input
                  id="professionalTitle"
                  value={formData.professionalTitle}
                  onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>
            </div>
          </div>

          {/* Education & Career */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Education & Career</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="education">Educational Background</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Describe your educational background, degrees, certifications..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentProfession">Current Profession</Label>
                  <Input
                    id="currentProfession"
                    value={formData.currentProfession}
                    onChange={(e) => handleInputChange('currentProfession', e.target.value)}
                    placeholder="Your current job title or profession"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="areasOfExpertise">Areas of Expertise</Label>
                <Textarea
                  id="areasOfExpertise"
                  value={formData.areasOfExpertise}
                  onChange={(e) => handleInputChange('areasOfExpertise', e.target.value)}
                  placeholder="List your key areas of expertise and specializations..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Interests & Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Interests & Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interests */}
              <div className="space-y-3">
                <Label>Interests & Hobbies</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button type="button" onClick={addInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <Label>Skills & Competencies</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Background */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Background</h3>
            <div className="space-y-2">
              <Label htmlFor="additionalBackground">Additional Context</Label>
              <Textarea
                id="additionalBackground"
                value={formData.additionalBackground}
                onChange={(e) => handleInputChange('additionalBackground', e.target.value)}
                placeholder="Share any additional information about yourself that would help create a more accurate simulation..."
                rows={4}
              />
            </div>
          </div>

          {/* Writing Sample */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Writing Sample
            </h3>
            <div className="space-y-2">
              <Label htmlFor="writingSample">Your Writing Style</Label>
              <p className="text-sm text-muted-foreground">
                Paste examples of your writing - emails, messages, essays, or any text that represents how you communicate. 
                This helps your Sim learn your unique tone, style, tempo, and voice.
              </p>
              <Textarea
                id="writingSample"
                value={formData.writingSample}
                onChange={(e) => handleInputChange('writingSample', e.target.value)}
                placeholder="Paste your writing samples here. Include emails you've sent, messages, blog posts, or any text that shows how you naturally communicate. The more varied the samples, the better your Sim will understand your voice.

Examples of good writing samples:
• Professional emails
• Casual messages to friends
• Social media posts
• Blog articles or essays
• Meeting notes or summaries
• Creative writing or personal reflections"
                className="min-h-[300px] resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.writingSample.length.toLocaleString()} characters
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
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              className={cn(
                "px-8 relative",
                hasUnsavedChanges && "pr-10"
              )}
              variant={hasUnsavedChanges ? "default" : "outline"}
              disabled={isLoading || isUploading || (formData.customUrl && isUrlAvailable === false)}
            >
              {isLoading || isUploading ? 'Saving...' : 'Save Context Window'}
              {hasUnsavedChanges && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfo;

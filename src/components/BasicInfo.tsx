
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BasicInfo = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    professionalTitle: "",
    dateOfBirth: undefined as Date | undefined,
    location: "",
    education: "",
    currentProfession: "",
    yearsExperience: "",
    areasOfExpertise: "",
    personalityType: "",
    communicationStyle: "",
    additionalBackground: ""
  });

  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const personalityTypes = [
    "Analytical",
    "Creative",
    "Collaborative",
    "Detail-oriented",
    "Strategic",
    "Empathetic",
    "Results-driven",
    "Innovative"
  ];

  const communicationStyles = [
    "Direct and concise",
    "Warm and conversational",
    "Professional and formal",
    "Casual and friendly",
    "Educational and detailed",
    "Inspiring and motivational"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSave = () => {
    console.log("Saving basic info:", { ...formData, interests, skills });
    // Here you would typically save the data to your backend
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
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

          {/* Personality & Communication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personality & Communication</h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Personality Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {personalityTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.personalityType.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleInputChange('personalityType', formData.personalityType ? `${formData.personalityType}, ${type}` : type);
                          } else {
                            const types = formData.personalityType.split(', ').filter(t => t !== type);
                            handleInputChange('personalityType', types.join(', '));
                          }
                        }}
                      />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Communication Style</Label>
                <RadioGroup
                  value={formData.communicationStyle}
                  onValueChange={(value) => handleInputChange('communicationStyle', value)}
                >
                  {communicationStyles.map((style) => (
                    <div key={style} className="flex items-center space-x-2">
                      <RadioGroupItem value={style} id={style} />
                      <Label htmlFor={style} className="text-sm">{style}</Label>
                    </div>
                  ))}
                </RadioGroup>
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

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="px-8">
              Save Basic Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfo;

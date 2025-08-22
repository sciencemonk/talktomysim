
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const BasicInfo = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    dateOfBirth: '',
    hometown: '',
    currentLocation: '',
    education: '',
    career: '',
    yearsOfExperience: '',
    personality: '',
    communicationStyle: '',
    expertise: '',
    background: ''
  });

  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving basic info:', { ...formData, interests, skills });
    toast({
      title: "Basic Info Saved",
      description: "Your basic information has been saved successfully."
    });
  };

  const personalityTypes = [
    "Analytical", "Creative", "Empathetic", "Logical", "Intuitive", 
    "Practical", "Visionary", "Detail-oriented", "Big-picture", "Collaborative"
  ];

  const communicationStyles = [
    "Direct", "Diplomatic", "Encouraging", "Formal", "Casual", 
    "Storytelling", "Data-driven", "Visual", "Conversational", "Structured"
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg">Basic Information</h1>
        <p className="text-fgMuted mt-2">
          Tell us about yourself to help create your personalized AI sim
        </p>
      </div>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>
            Basic information about who you are
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Software Engineer, Teacher, Manager"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hometown">Hometown</Label>
              <Input
                id="hometown"
                value={formData.hometown}
                onChange={(e) => handleInputChange('hometown', e.target.value)}
                placeholder="Where you grew up"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentLocation">Current Location</Label>
            <Input
              id="currentLocation"
              value={formData.currentLocation}
              onChange={(e) => handleInputChange('currentLocation', e.target.value)}
              placeholder="Where you currently live"
            />
          </div>
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card>
        <CardHeader>
          <CardTitle>Education & Career</CardTitle>
          <CardDescription>
            Your educational background and professional experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="Describe your educational background (degrees, institutions, certifications)"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="career">Career/Profession</Label>
              <Input
                id="career"
                value={formData.career}
                onChange={(e) => handleInputChange('career', e.target.value)}
                placeholder="Your current profession or field"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                placeholder="Years in your field"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Areas of Expertise</Label>
            <Textarea
              id="expertise"
              value={formData.expertise}
              onChange={(e) => handleInputChange('expertise', e.target.value)}
              placeholder="What are you particularly good at or known for?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personality & Communication */}
      <Card>
        <CardHeader>
          <CardTitle>Personality & Communication Style</CardTitle>
          <CardDescription>
            How you think and communicate with others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Personality Type</Label>
            <Select value={formData.personality} onValueChange={(value) => handleInputChange('personality', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your personality type" />
              </SelectTrigger>
              <SelectContent>
                {personalityTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Communication Style</Label>
            <Select value={formData.communicationStyle} onValueChange={(value) => handleInputChange('communicationStyle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your communication style" />
              </SelectTrigger>
              <SelectContent>
                {communicationStyles.map((style) => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Interests & Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Interests & Skills</CardTitle>
          <CardDescription>
            What you're passionate about and what you're good at
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Interests & Hobbies</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add an interest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <Button onClick={addInterest} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills & Competencies</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="outline" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background & Context */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Background</CardTitle>
          <CardDescription>
            Any other information that helps define who you are
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="background">Personal Background & Context</Label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e) => handleInputChange('background', e.target.value)}
              placeholder="Share any additional context about your background, values, experiences, or anything else that makes you unique"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save Basic Information
        </Button>
      </div>
    </div>
  );
};

export default BasicInfo;

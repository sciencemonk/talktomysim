
import { useState } from "react";
import { User, Save, ArrowLeft, Baby, MapPin, Heart, Calendar, Smile } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ChildProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    age: "",
    grade: "",
    interests: "",
    hometown: "",
    favoriteSubjects: "",
    learningStyle: "",
    personality: "",
    goals: ""
  });

  const handleSave = () => {
    toast({
      title: "Profile saved",
      description: "Your child's profile has been updated successfully.",
    });
  };

  const updateProfile = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Child Profile</h1>
          <p className="text-muted-foreground">Help us personalize your child's learning experience</p>
          <Link to="/dashboard" className="mt-4 inline-block">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Profile
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Tell us about your child</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => updateProfile('firstName', e.target.value)}
                placeholder="Enter your child's first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => updateProfile('lastName', e.target.value)}
                placeholder="Enter your child's last name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => updateProfile('age', e.target.value)}
                placeholder="Enter your child's age"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={profile.grade} onValueChange={(value) => updateProfile('grade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-k">Pre-K</SelectItem>
                  <SelectItem value="k">Kindergarten</SelectItem>
                  <SelectItem value="1">1st Grade</SelectItem>
                  <SelectItem value="2">2nd Grade</SelectItem>
                  <SelectItem value="3">3rd Grade</SelectItem>
                  <SelectItem value="4">4th Grade</SelectItem>
                  <SelectItem value="5">5th Grade</SelectItem>
                  <SelectItem value="6">6th Grade</SelectItem>
                  <SelectItem value="7">7th Grade</SelectItem>
                  <SelectItem value="8">8th Grade</SelectItem>
                  <SelectItem value="9">9th Grade</SelectItem>
                  <SelectItem value="10">10th Grade</SelectItem>
                  <SelectItem value="11">11th Grade</SelectItem>
                  <SelectItem value="12">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hometown">Hometown</Label>
            <Input
              id="hometown"
              value={profile.hometown}
              onChange={(e) => updateProfile('hometown', e.target.value)}
              placeholder="Enter your child's hometown"
            />
          </div>
        </CardContent>
      </Card>

      {/* Interests & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Interests & Preferences
          </CardTitle>
          <CardDescription>Help us understand what your child loves</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interests">Hobbies & Interests</Label>
            <Textarea
              id="interests"
              value={profile.interests}
              onChange={(e) => updateProfile('interests', e.target.value)}
              placeholder="What does your child love to do? (e.g., sports, music, art, reading, video games)"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="favoriteSubjects">Favorite School Subjects</Label>
            <Textarea
              id="favoriteSubjects"
              value={profile.favoriteSubjects}
              onChange={(e) => updateProfile('favoriteSubjects', e.target.value)}
              placeholder="Which subjects does your child enjoy most?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Learning Style
          </CardTitle>
          <CardDescription>How does your child learn best?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="learningStyle">Learning Style</Label>
            <Select value={profile.learningStyle} onValueChange={(value) => updateProfile('learningStyle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="How does your child prefer to learn?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual (pictures, diagrams, charts)</SelectItem>
                <SelectItem value="auditory">Auditory (listening, discussing)</SelectItem>
                <SelectItem value="kinesthetic">Kinesthetic (hands-on, movement)</SelectItem>
                <SelectItem value="reading">Reading/Writing (text-based)</SelectItem>
                <SelectItem value="mixed">Mixed (combination of styles)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="personality">Personality & Communication Style</Label>
            <Textarea
              id="personality"
              value={profile.personality}
              onChange={(e) => updateProfile('personality', e.target.value)}
              placeholder="How would you describe your child's personality? Are they shy, outgoing, curious, etc.?"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Goals & Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Learning Goals
          </CardTitle>
          <CardDescription>What would you like your child to work on?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goals">Learning Goals & Objectives</Label>
            <Textarea
              id="goals"
              value={profile.goals}
              onChange={(e) => updateProfile('goals', e.target.value)}
              placeholder="What specific skills or subjects would you like your child to improve? Any challenges they're facing?"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildProfile;

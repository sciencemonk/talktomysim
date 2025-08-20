
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useState } from "react";

const ChildProfile = () => {
  const [interests, setInterests] = useState<string[]>(["Math", "Science", "Reading"]);
  const [newInterest, setNewInterest] = useState("");

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Tell us about your child to personalize their learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="childName">Child's Name</Label>
              <Input
                id="childName"
                placeholder="Enter your child's name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                min="5"
                max="18"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeLevel">Grade Level</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kindergarten">Kindergarten</SelectItem>
                <SelectItem value="1st">1st Grade</SelectItem>
                <SelectItem value="2nd">2nd Grade</SelectItem>
                <SelectItem value="3rd">3rd Grade</SelectItem>
                <SelectItem value="4th">4th Grade</SelectItem>
                <SelectItem value="5th">5th Grade</SelectItem>
                <SelectItem value="6th">6th Grade</SelectItem>
                <SelectItem value="7th">7th Grade</SelectItem>
                <SelectItem value="8th">8th Grade</SelectItem>
                <SelectItem value="9th">9th Grade</SelectItem>
                <SelectItem value="10th">10th Grade</SelectItem>
                <SelectItem value="11th">11th Grade</SelectItem>
                <SelectItem value="12th">12th Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
          <CardDescription>
            Help us understand how your child learns best
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="learningStyle">Preferred Learning Style</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select learning style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual Learner</SelectItem>
                <SelectItem value="auditory">Auditory Learner</SelectItem>
                <SelectItem value="kinesthetic">Kinesthetic Learner</SelectItem>
                <SelectItem value="reading">Reading/Writing Learner</SelectItem>
                <SelectItem value="mixed">Mixed Learning Style</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Current Difficulty Level</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="gifted">Gifted/Accelerated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interests & Goals</CardTitle>
          <CardDescription>
            What subjects and activities interest your child?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Interests</Label>
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
              <Button onClick={addInterest} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goals">Learning Goals</Label>
            <Textarea
              id="goals"
              placeholder="What would you like your child to achieve? (e.g., improve math skills, develop reading comprehension, prepare for tests)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Special Considerations</CardTitle>
          <CardDescription>
            Any additional information that might help personalize the experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialNeeds">Special Needs or Accommodations</Label>
            <Textarea
              id="specialNeeds"
              placeholder="Please describe any learning differences, accommodations needed, or other considerations"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivation">What motivates your child?</Label>
            <Textarea
              id="motivation"
              placeholder="What rewards, topics, or approaches work best to keep your child engaged?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg">Save Profile</Button>
      </div>
    </div>
  );
};

export default ChildProfile;


import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bot, Mic, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LiveTranscription } from "@/components/LiveTranscription";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CreateTutor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorConfig, setTutorConfig] = useState({
    name: "",
    subject: "",
    gradeLevel: "",
    purpose: "",
    teachingStyle: ""
  });
  
  const handleCreateTutor = () => {
    if (!tutorConfig.name || !tutorConfig.subject || !tutorConfig.gradeLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in the tutor name, subject, and grade level.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: "Tutor Created!",
        description: `${tutorConfig.name} has been successfully created.`,
      });
      setIsSubmitting(false);
      navigate("/agents");
    }, 1500);
  };
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link to="/agents" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Tutors
        </Link>
      </div>
      
      <div className="flex items-center space-x-3 mb-6">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Create New AI Tutor</h1>
          <p className="text-muted-foreground mt-1">Set up a personalized tutor for your students</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tutor Configuration</CardTitle>
          <CardDescription>
            Fill in the details to create your AI tutor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tutor Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Ms. Johnson, Math Helper"
                value={tutorConfig.name}
                onChange={(e) => setTutorConfig(prev => ({...prev, name: e.target.value}))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select 
                value={tutorConfig.subject} 
                onValueChange={(value) => setTutorConfig(prev => ({...prev, subject: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="english">English/Language Arts</SelectItem>
                  <SelectItem value="history">History/Social Studies</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level *</Label>
              <Select 
                value={tutorConfig.gradeLevel} 
                onValueChange={(value) => setTutorConfig(prev => ({...prev, gradeLevel: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="k-2">Kindergarten - 2nd Grade</SelectItem>
                  <SelectItem value="3-5">3rd - 5th Grade</SelectItem>
                  <SelectItem value="6-8">6th - 8th Grade</SelectItem>
                  <SelectItem value="9-12">9th - 12th Grade</SelectItem>
                  <SelectItem value="college">College Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teachingStyle">Teaching Style</Label>
              <Select 
                value={tutorConfig.teachingStyle} 
                onValueChange={(value) => setTutorConfig(prev => ({...prev, teachingStyle: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teaching style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="encouraging">Encouraging & Supportive</SelectItem>
                  <SelectItem value="socratic">Socratic Method</SelectItem>
                  <SelectItem value="patient">Patient & Step-by-step</SelectItem>
                  <SelectItem value="fun">Fun & Engaging</SelectItem>
                  <SelectItem value="structured">Structured & Organized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">What will this tutor help with?</Label>
            <Textarea
              id="purpose"
              placeholder="e.g., Help students with algebra homework, explain concepts clearly, and provide practice problems"
              value={tutorConfig.purpose}
              onChange={(e) => setTutorConfig(prev => ({...prev, purpose: e.target.value}))}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button 
            onClick={handleCreateTutor} 
            disabled={isSubmitting || !tutorConfig.name || !tutorConfig.subject || !tutorConfig.gradeLevel}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Tutor...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Create AI Tutor
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateTutor;

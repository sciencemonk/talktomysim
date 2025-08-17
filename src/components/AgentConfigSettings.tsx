
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentType, VoiceTrait } from '@/types/agent';
import { updateAgent } from '@/services/agentService';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bot, Target, User, FileText, GraduationCap, BookOpen, Calculator, 
  Microscope, PenTool, Globe, Brain
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import debounce from 'lodash/debounce';
import { useToast } from "@/components/ui/use-toast";
import { isEqual } from 'lodash';

const SUBJECTS = [
  { id: "math", name: "Mathematics", icon: <Calculator className="h-4 w-4" /> },
  { id: "science", name: "Science", icon: <Microscope className="h-4 w-4" /> },
  { id: "english", name: "English/Language Arts", icon: <PenTool className="h-4 w-4" /> },
  { id: "history", name: "History/Social Studies", icon: <Globe className="h-4 w-4" /> },
  { id: "reading", name: "Reading", icon: <BookOpen className="h-4 w-4" /> },
  { id: "writing", name: "Writing", icon: <PenTool className="h-4 w-4" /> },
  { id: "other", name: "Other Subject", icon: <GraduationCap className="h-4 w-4" /> }
];

const GRADE_LEVELS = [
  { id: "k-2", name: "Kindergarten - 2nd Grade" },
  { id: "3-5", name: "3rd - 5th Grade" },
  { id: "6-8", name: "6th - 8th Grade" },
  { id: "9-12", name: "9th - 12th Grade" },
  { id: "college", name: "College Level" },
  { id: "adult", name: "Adult Education" }
];

interface TeacherConfigSettingsProps {
  agent: AgentType;
  onAgentUpdate: (updatedAgent: AgentType) => void;
  showSuccessToast?: (title: string, description: string) => void;
}

const TeacherConfigSettings: React.FC<TeacherConfigSettingsProps> = ({ agent, onAgentUpdate, showSuccessToast }) => {
  const { toast } = useToast();
  const [name, setName] = useState(agent.name);
  const [avatar, setAvatar] = useState(agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`);
  const [prompt, setPrompt] = useState(agent.prompt || '');
  const [subject, setSubject] = useState(agent.subject || '');
  const [gradeLevel, setGradeLevel] = useState(agent.gradeLevel || '');
  const [learningObjective, setLearningObjective] = useState(agent.learningObjective || '');
  const [customSubject, setCustomSubject] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const prevValuesRef = useRef({
    name: agent.name,
    avatar: agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`,
    prompt: agent.prompt || '',
    subject: agent.subject || '',
    gradeLevel: agent.gradeLevel || '',
    learningObjective: agent.learningObjective || ''
  });

  const isCreationMode = agent.id.startsWith('temp-');

  const debouncedSave = React.useCallback(
    debounce(async (updatedData) => {
      // Skip auto-save during creation mode
      if (isCreationMode) {
        console.log('Skipping auto-save during creation mode');
        return;
      }

      try {
        setIsSaving(true);
        const updatedAgent = await updateAgent(agent.id, updatedData);
        onAgentUpdate(updatedAgent);
        
        if (showSuccessToast) {
          showSuccessToast("Changes saved", "Your tutor has been updated automatically.");
        } else {
          toast({
            title: "Changes saved",
            description: "Your tutor has been updated automatically."
          });
        }
      } catch (error) {
        console.error("Error saving tutor settings:", error);
        toast({
          title: "Failed to save changes",
          description: "There was an error updating your tutor.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [agent.id, onAgentUpdate, toast, showSuccessToast, isCreationMode]
  );

  useEffect(() => {
    const finalSubject = subject === 'other' ? customSubject : subject;
    
    const currentValues = {
      name,
      avatar,
      prompt,
      subject: finalSubject,
      gradeLevel,
      learningObjective
    };
    
    // Update the agent data immediately for creation mode
    if (isCreationMode) {
      onAgentUpdate({
        ...agent,
        ...currentValues
      });
    } else if (!isEqual(currentValues, prevValuesRef.current)) {
      debouncedSave(currentValues);
    }
    
    prevValuesRef.current = { ...currentValues };
  }, [name, avatar, prompt, subject, gradeLevel, learningObjective, customSubject, debouncedSave, isCreationMode, agent, onAgentUpdate]);

  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 10);
    setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  const generatePrompt = () => {
    const subjectName = subject === 'other' ? customSubject : SUBJECTS.find(s => s.id === subject)?.name || 'the subject';
    const gradeName = GRADE_LEVELS.find(g => g.id === gradeLevel)?.name || 'students';
    
    const basePrompt = `You are ${name}, a friendly and knowledgeable tutor specializing in ${subjectName} for ${gradeName}.

Your main goals are to:
- Help students understand concepts clearly
- Provide step-by-step explanations
- Encourage students when they struggle
- Ask questions to check understanding
- Make learning engaging and fun

${learningObjective ? `Learning Objective: ${learningObjective}

Focus on helping students achieve this specific learning objective through your teaching.` : ''}

Always be patient, supportive, and adapt to each student's learning pace. If a student seems confused, break down concepts into smaller steps. Celebrate their progress and effort!`;

    setPrompt(basePrompt);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tutor Identity</CardTitle>
          <CardDescription>
            Set up your AI tutor's name and appearance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-2 border-primary/30">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>
                  <Bot className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="w-full space-y-3">
                <Label htmlFor="tutor-avatar">Avatar URL</Label>
                <Input
                  id="tutor-avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Enter avatar URL"
                />
                <Button 
                  variant="outline" 
                  onClick={generateRandomAvatar} 
                  className="w-full"
                  size="sm"
                >
                  Generate Random Avatar
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tutor-name">Tutor Name</Label>
                <Input
                  id="tutor-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ms. Johnson, Mr. Smith"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Teaching Configuration</CardTitle>
          <CardDescription>
            Configure what and how your tutor teaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map((subj) => (
                    <Button
                      key={subj.id}
                      type="button"
                      variant={subject === subj.id ? "default" : "outline"}
                      className="justify-start gap-2 text-sm"
                      onClick={() => setSubject(subj.id)}
                    >
                      {subj.icon}
                      <span className="truncate">{subj.name}</span>
                    </Button>
                  ))}
                </div>
                
                {subject === 'other' && (
                  <Input
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter subject name"
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Grade Level</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learning-objective">Learning Objective</Label>
              <Textarea
                id="learning-objective"
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                placeholder="e.g., Help students master solving quadratic equations and understand their real-world applications"
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Describe what specific learning goals this tutor should help students achieve
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Teaching Instructions</CardTitle>
          <CardDescription>
            Customize how your tutor communicates with students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button 
                onClick={generatePrompt}
                variant="outline"
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Generate Instructions
              </Button>
            </div>
            
            <div>
              <Label htmlFor="tutor-prompt">Teaching Instructions</Label>
              <Textarea
                id="tutor-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter detailed instructions for how your tutor should behave and teach..."
                className="min-h-[200px] font-mono text-sm mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                These instructions tell your AI tutor how to interact with students and what teaching approach to use
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isSaving && !isCreationMode && (
        <div className="fixed bottom-4 right-4 bg-secondary/80 text-foreground px-4 py-2 rounded-md text-sm animate-in fade-in slide-in-from-bottom-4">
          Saving changes...
        </div>
      )}
    </div>
  );
};

export default TeacherConfigSettings;

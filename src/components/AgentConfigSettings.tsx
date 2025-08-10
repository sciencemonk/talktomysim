
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
  Microscope, PenTool, Globe, Volume2, ChevronDown, Brain
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import debounce from 'lodash/debounce';
import { useToast } from "@/components/ui/use-toast";
import { isEqual } from 'lodash';
import VoiceSelectionModal from './VoiceSelectionModal';

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

const TEACHING_STYLES = [
  { id: "encouraging", name: "Encouraging & Supportive" },
  { id: "socratic", name: "Socratic Method (Question-based)" },
  { id: "patient", name: "Patient & Step-by-step" },
  { id: "fun", name: "Fun & Engaging" },
  { id: "structured", name: "Structured & Organized" },
  { id: "adaptive", name: "Adaptive to Student Needs" }
];

const AI_MODELS = [
  { id: "GPT-4", name: "GPT-4 (Recommended)" },
  { id: "GPT-3.5", name: "GPT-3.5 (Faster)" },
  { id: "Claude-3", name: "Claude 3" }
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
  const [purpose, setPurpose] = useState(agent.purpose || '');
  const [prompt, setPrompt] = useState(agent.prompt || '');
  const [subject, setSubject] = useState(agent.subject || '');
  const [gradeLevel, setGradeLevel] = useState(agent.gradeLevel || '');
  const [teachingStyle, setTeachingStyle] = useState(agent.teachingStyle || '');
  const [customSubject, setCustomSubject] = useState('');
  const [model, setModel] = useState(agent.model || 'GPT-4');
  const [voice, setVoice] = useState(agent.voice || '9BWtsMINqrJLrRacOk9x');
  const [voiceProvider, setVoiceProvider] = useState(agent.voiceProvider || 'Eleven Labs');
  const [isSaving, setIsSaving] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  
  const prevValuesRef = useRef({
    name: agent.name,
    avatar: agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`,
    purpose: agent.purpose || '',
    prompt: agent.prompt || '',
    subject: agent.subject || '',
    gradeLevel: agent.gradeLevel || '',
    teachingStyle: agent.teachingStyle || '',
    model: agent.model || 'GPT-4',
    voice: agent.voice || '9BWtsMINqrJLrRacOk9x',
    voiceProvider: agent.voiceProvider || 'Eleven Labs'
  });

  const debouncedSave = React.useCallback(
    debounce(async (updatedData) => {
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
    [agent.id, onAgentUpdate, toast, showSuccessToast]
  );

  useEffect(() => {
    const finalSubject = subject === 'other' ? customSubject : subject;
    
    const currentValues = {
      name,
      avatar,
      purpose,
      prompt,
      subject: finalSubject,
      gradeLevel,
      teachingStyle,
      model,
      voice,
      voiceProvider
    };
    
    if (!isEqual(currentValues, prevValuesRef.current)) {
      debouncedSave(currentValues);
      prevValuesRef.current = { ...currentValues };
    }
  }, [name, avatar, purpose, prompt, subject, gradeLevel, teachingStyle, customSubject, model, voice, voiceProvider, debouncedSave]);

  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 10);
    setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  const getCurrentVoiceDetails = () => {
    return {
      name: "Aria",
      provider: "Eleven Labs"
    };
  };

  const currentVoiceDetails = getCurrentVoiceDetails();

  const generatePrompt = () => {
    const subjectName = subject === 'other' ? customSubject : SUBJECTS.find(s => s.id === subject)?.name || 'the subject';
    const gradeName = GRADE_LEVELS.find(g => g.id === gradeLevel)?.name || 'students';
    const styleName = TEACHING_STYLES.find(s => s.id === teachingStyle)?.name || 'helpful';
    
    const basePrompt = `You are ${name}, a friendly and knowledgeable tutor specializing in ${subjectName} for ${gradeName}. Your teaching style is ${styleName.toLowerCase()}.

Your main goals are to:
- Help students understand concepts clearly
- Provide step-by-step explanations
- Encourage students when they struggle
- Ask questions to check understanding
- Make learning engaging and fun

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
              
              <div className="space-y-2">
                <Label htmlFor="tutor-purpose">What will this tutor help with?</Label>
                <Textarea
                  id="tutor-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Help students with algebra homework and explain math concepts clearly"
                  className="min-h-[80px]"
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
              <Label>Teaching Style</Label>
              <Select value={teachingStyle} onValueChange={setTeachingStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose teaching approach" />
                </SelectTrigger>
                <SelectContent>
                  {TEACHING_STYLES.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((aiModel) => (
                      <SelectItem key={aiModel.id} value={aiModel.id}>
                        {aiModel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Voice</Label>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setVoiceModalOpen(true)}
                >
                  <span>{currentVoiceDetails.name} - {currentVoiceDetails.provider}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </div>
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
      
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-secondary/80 text-foreground px-4 py-2 rounded-md text-sm animate-in fade-in slide-in-from-bottom-4">
          Saving changes...
        </div>
      )}
      
      <VoiceSelectionModal
        open={voiceModalOpen}
        onOpenChange={setVoiceModalOpen}
        selectedVoice={voice}
        onVoiceSelect={(voiceId) => setVoice(voiceId)}
        voiceProvider={voiceProvider}
        onVoiceProviderChange={setVoiceProvider}
      />
    </div>
  );
};

export default TeacherConfigSettings;

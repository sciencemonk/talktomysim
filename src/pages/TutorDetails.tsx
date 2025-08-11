
import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Trash2, AlertCircle, Loader2, History, Cpu, Calendar, Mic, Volume2, MessageSquare, Plus, Play, Pause, Phone, Copy, PhoneOutgoing, PhoneIncoming, Mail, Send, MoreVertical, Archive, UserMinus, PenSquare, Cog, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { VoiceTrait, AgentType } from "@/types/agent";
import { useTutorDetails } from "@/hooks/useTutorDetails";
import { AgentSetupStepper } from "@/components/AgentSetupStepper";
import { AgentToggle } from "@/components/AgentToggle";
import { AgentChannels } from "@/components/AgentChannels";
import { AgentStats } from "@/components/AgentStats";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateTutor } from "@/services/tutorService";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AgentConfigSettings from "@/components/AgentConfigSettings";
import { RolePlayDialog } from "@/components/RolePlayDialog";
import { CustomTooltip } from "@/components/CustomTooltip";
import { UserPersonasSidebar } from "@/components/UserPersonasSidebar";
import { CallInterface } from "@/components/CallInterface";
import { StudentUsageStats } from "@/components/StudentUsageStats";

const TutorDetails = () => {
  const { tutorId } = useParams<{ tutorId: string; }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    tutor,
    isLoading,
    error,
    isRolePlayOpen,
    openRolePlay,
    closeRolePlay,
    isDirectCallActive,
    directCallInfo,
    startDirectCall,
    endDirectCall
  } = useTutorDetails(tutorId);
  
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const [isPersonasSidebarOpen, setIsPersonasSidebarOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);
  
  useEffect(() => {
    if (tutor) {
      setIsActive(tutor.status === "active");
    }
  }, [tutor]);
  
  const handleStatusToggle = () => {
    setIsActive(!isActive);
    toast({
      title: !isActive ? "Tutor Activated" : "Tutor Deactivated",
      description: !isActive ? "Your tutor is now active and will process requests." : "Your tutor has been deactivated and won't process new requests.",
      variant: !isActive ? "default" : "destructive"
    });
  };
  
  const handleDelete = () => {
    toast({
      title: "Tutor deleted",
      description: "The tutor has been successfully deleted.",
      variant: "destructive"
    });
    navigate("/tutors");
  };
  
  const handleUpdateChannel = async (channel: string, config: {
    enabled: boolean;
    details?: string;
    config?: Record<string, any>;
  }) => {
    if (!tutor || !tutorId) return;
    let updatedChannels: string[] = [...(tutor.channels || [])];
    if (config.enabled && !updatedChannels.includes(channel)) {
      updatedChannels.push(channel);
    } else if (!config.enabled && updatedChannels.includes(channel)) {
      updatedChannels = updatedChannels.filter(c => c !== channel);
    }
    try {
      const updatedTutor = {
        ...tutor,
        channels: updatedChannels,
        channelConfigs: {
          ...(tutor.channelConfigs || {}),
          [channel]: config
        }
      };
      await updateTutor(tutorId, updatedTutor);
      setIsActive(updatedTutor.status === "active");
      toast({
        title: config.enabled ? "Channel enabled" : "Channel disabled",
        description: `The ${channel} channel has been updated.`
      });
    } catch (error) {
      toast({
        title: "Failed to update channel",
        description: "There was an error updating the channel configuration.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeactivateTutor = () => {
    setIsActive(false);
    toast({
      title: "Tutor Deactivated",
      description: "Your tutor has been deactivated and won't process new requests.",
      variant: "destructive"
    });
  };
  
  const handleArchiveTutor = () => {
    toast({
      title: "Tutor Archived",
      description: "The tutor has been archived and can be restored later."
    });
    navigate("/tutors");
  };
  
  const handleEditClick = () => {
    toast({
      title: "Edit Mode",
      description: "You can now edit your tutor's details."
    });
  };
  
  const handleTutorUpdate = (updatedTutor: AgentType) => {
    setIsActive(updatedTutor.status === "active");
    if (updatedTutor.name !== tutor?.name) {
      toast({
        title: "Tutor name updated",
        description: `The tutor name has been updated to ${updatedTutor.name}.`
      });
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>;
  }
  
  if (error || !tutor) {
    return <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <Link to="/tutors" className="flex items-center text-gray-500 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutors
          </Link>
        </div>
        
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "This tutor could not be found or you don't have permission to view it."}
          </AlertDescription>
        </Alert>
        
        <Button onClick={() => navigate("/tutors")}>Return to Dashboard</Button>
      </div>;
  }
  
  const lastUpdated = new Date().toLocaleString();
  const activeChannels = Object.entries(tutor.channelConfigs || {}).filter(([_, config]) => config.enabled).map(([channel]) => channel);
  const isNewTutor = tutor.id === "new123";
  
  return <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="mb-6">
        <Link to="/tutors" className="flex items-center text-gray-500 hover:text-primary transition-colors duration-200">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Back to Tutors</span>
        </Link>
      </div>
      
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-start">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-primary/30">
                <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${tutor.id}`} alt={tutor.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  <Bot className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {tutor.name}
                </h1>
                {isActive ? <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Active
                    </span>
                  </Badge> : <Badge variant="outline" className="border-border">
                    {tutor.type}
                  </Badge>}
              </div>
              <p className="text-muted-foreground mt-1.5 max-w-2xl">{tutor.description}</p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <AgentToggle isActive={isActive} onToggle={handleStatusToggle} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hover:bg-secondary">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer flex items-center gap-2">
                    <PenSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Edit Tutor</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeactivateTutor} className="cursor-pointer flex items-center gap-2">
                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                    <span>Deactivate Tutor</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchiveTutor} className="cursor-pointer flex items-center gap-2">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                    <span>Archive Tutor</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="cursor-pointer flex items-center gap-2 text-red-400">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Tutor</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              {activeChannels.length > 0 && <div className="flex flex-wrap gap-2">
                  {activeChannels.includes('voice') && <Badge variant="secondary">
                      <Mic className="h-3 w-3 mr-1" />
                      <span className="text-xs">Voice</span>
                    </Badge>}
                  {activeChannels.includes('chat') && <Badge variant="secondary">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span className="text-xs">Chat</span>
                    </Badge>}
                  {activeChannels.includes('email') && <Badge variant="secondary">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="text-xs">Email</span>
                    </Badge>}
                </div>}
              
              <div className="mt-2">
                <AgentStats avmScore={tutor.avmScore} interactionCount={tutor.interactions || 0} csat={tutor.csat} performance={tutor.performance} isNewAgent={isNewTutor} showZeroValues={false} hideInteractions={true} />
              </div>
              
              <div className="flex justify-end text-xs text-muted-foreground mt-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Created: {tutor.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Updated: {lastUpdated.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup" className="text-sm">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Student Usage
            </span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-sm">
            <span className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Settings
            </span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="setup" className="space-y-6">
            <StudentUsageStats agent={tutor} />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <AgentConfigSettings agent={tutor} onAgentUpdate={handleTutorUpdate} />
          </TabsContent>
        </div>
      </Tabs>

      <CallInterface
        open={isDirectCallActive}
        onOpenChange={(open) => {
          if (!open) endDirectCall();
        }}
        persona={selectedPersona}
        directCallInfo={directCallInfo}
        onCallComplete={(recordingData) => {
          toast({
            title: "Call completed",
            description: `Call with ${recordingData.title} has been recorded.`
          });
        }}
      />

      <UserPersonasSidebar
        open={isPersonasSidebarOpen}
        onOpenChange={setIsPersonasSidebarOpen}
        onSelectPersona={(persona) => {
          setSelectedPersona(persona);
        }}
        onStartDirectCall={startDirectCall}
      />
    </div>;
};

export default TutorDetails;

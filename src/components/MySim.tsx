
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageCircle, BookOpen, ExternalLink, Settings, Globe, FileText, BarChart3, Users, AlertTriangle } from "lucide-react";
import { useSim } from "@/hooks/useSim";
import { useQuery } from '@tanstack/react-query';
import { conversationService } from '@/services/conversationService';
import { ChatModal } from './ChatModal';

const MySim = () => {
  const {
    sim,
    completionStatus,
    isLoading,
    updateBasicInfo
  } = useSim();

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Fetch conversations for this sim
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['advisor-conversations', sim?.id],
    queryFn: () => conversationService.getAdvisorConversations(sim?.id || ''),
    enabled: !!sim?.id,
  });

  const handleConversationClick = (conversation: any) => {
    setSelectedConversation(conversation);
    setIsChatModalOpen(true);
  };

  // Filter conversations
  const escalatedConversations = conversations.filter(conv => conv.escalated);
  const contactConversations = conversations.filter(conv => !conv.is_anonymous);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your sim...</p>
        </div>
      </div>;
  }

  return <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Compact Header Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={sim?.avatar_url} alt={sim?.name || "Sim Avatar"} />
                <AvatarFallback>
                  {sim?.name?.charAt(0)?.toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">
                  {sim?.name || "Unnamed Sim"}
                </h3>
                {sim?.professional_title && (
                  <p className="text-sm text-muted-foreground truncate">{sim.professional_title}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild size="sm" className="w-full sm:w-auto flex-shrink-0">
              <a href={`/${sim?.custom_url || sim?.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Talk to Your Sim
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversations & Leads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversations & Leads
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor escalated conversations and captured contact information
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contacts ({contactConversations.length})
              </TabsTrigger>
              <TabsTrigger value="escalated" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Escalated ({escalatedConversations.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                All ({conversations.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="contacts" className="mt-6">
              {contactConversations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No captured contacts yet</h3>
                  <p className="text-muted-foreground">
                    Contacts will appear here when conversations meet your escalation criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contactConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Contact</span>
                            <Badge variant="secondary" className="text-xs">
                              {conversation.message_count} messages
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {conversation.latest_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="escalated" className="mt-6">
              {escalatedConversations.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No escalated conversations</h3>
                  <p className="text-muted-foreground">
                    Escalated conversations will appear here when users need human assistance
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {escalatedConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors border-destructive/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Escalated</span>
                            <Badge variant="destructive" className="text-xs">
                              Needs attention
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {conversation.message_count} messages
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {conversation.latest_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all" className="mt-6">
              {conversationsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground">
                    Conversations will appear here once users start chatting with your sim
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          {conversation.is_anonymous ? (
                            <User className="h-4 w-4 text-primary" />
                          ) : (
                            <MessageCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {conversation.is_anonymous ? 'Anonymous User' : 'User'}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {conversation.message_count} messages
                            </Badge>
                            {conversation.escalated && (
                              <Badge variant="destructive" className="text-xs">
                                Escalated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {conversation.latest_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setSelectedConversation(null);
        }}
        conversation={selectedConversation}
        simName={sim?.name || 'Sim'}
      />

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Advanced analytics and insights will be available here
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Detailed conversation analytics, conversion rates, and performance metrics coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};

export default MySim;

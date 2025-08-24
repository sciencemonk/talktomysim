
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MessageCircle, ExternalLink, Globe, Clock } from "lucide-react";
import { useSim } from "@/hooks/useSim";
import { useQuery } from '@tanstack/react-query';
import { conversationService } from '@/services/conversationService';
import { ChatModal } from './ChatModal';
import { ChatInterface } from './ChatInterface';

const MySim = () => {
  const {
    sim,
    completionStatus,
    isLoading,
    updateBasicInfo
  } = useSim();

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Fetch conversations for this sim
  const { data: conversations = [], isLoading: conversationsLoading, refetch } = useQuery({
    queryKey: ['advisor-conversations', sim?.id],
    queryFn: async () => {
      console.log('Fetching conversations for sim:', sim?.id);
      const result = await conversationService.getAdvisorConversations(sim?.id || '');
      console.log('Conversations fetched:', result);
      return result;
    },
    enabled: !!sim?.id,
    refetchInterval: 10000, // Refetch every 10 seconds to show new conversations
  });

  const handleConversationClick = (conversation: any) => {
    console.log('Opening conversation:', conversation);
    setSelectedConversation(conversation);
    setIsChatModalOpen(true);
  };

  const handleTalkToSim = () => {
    setShowChat(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your sim...</p>
        </div>
      </div>;
  }

  // Show chat interface if user wants to talk to their sim
  if (showChat && sim) {
    return (
      <div className="h-full">
        <ChatInterface 
          agent={sim}
          onBack={() => setShowChat(false)}
          isUserOwnSim={true}
        />
      </div>
    );
  }

  return <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Talk to Your Sim Button */}
      {sim && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Talk to Your Sim
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Test and interact with your sim directly
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTalkToSim} className="w-full">
              Start Conversation with {sim.name}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            All Conversations ({conversations.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            All conversations users are having with your sim (authenticated and anonymous users)
          </p>
        </CardHeader>
        <CardContent>
          {conversationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                    <div className="h-3 bg-muted rounded w-16"></div>
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
              <p className="text-sm text-muted-foreground mt-2">
                Debug: Sim ID = {sim?.id}
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {conversation.message_count} messages
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {conversation.latest_message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(conversation.updated_at)}
                        </div>
                        {conversation.avg_score > 0 && (
                          <div>Score: {conversation.avg_score.toFixed(1)}/10</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>;
};

export default MySim;

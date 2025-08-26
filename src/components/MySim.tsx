
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ExternalLink, Globe, Clock, Trash2, Search, Filter, MessageCircle } from "lucide-react";
import { useSim } from "@/hooks/useSim";
import { useQuery } from '@tanstack/react-query';
import { conversationService } from '@/services/conversationService';
import { ChatModal } from './ChatModal';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';



const MySim = () => {
  const {
    sim,
    completionStatus,
    isLoading,
    updateBasicInfo
  } = useSim();

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch conversations for this sim
  const { data: conversations = [], isLoading: conversationsLoading, refetch } = useQuery({
    queryKey: ['advisor-conversations', sim?.id],
    queryFn: async () => {
      console.log('Fetching conversations for sim:', sim?.id);
      if (!sim?.id) {
        console.error('No sim ID available for fetching conversations');
        return [];
      }
      
      // Get all public conversations (memory-based and database)
      const result = await conversationService.getAdvisorConversations(sim.id, { excludeOwner: true });
      console.log(`Conversations fetched (excluding owner): ${result.length} conversations`);
      
      // Force scan localStorage for public conversations
      // This ensures we catch any public conversations that might have been missed
      const memoryConversations = await conversationService.scanLocalStorageForPublicConversations(sim.id);
      console.log(`Memory-based public conversations found: ${memoryConversations.length}`);
      
      // Combine results, removing duplicates by ID
      const combinedResults = [...result];
      memoryConversations.forEach(memConv => {
        if (!combinedResults.some(c => c.id === memConv.id)) {
          combinedResults.push(memConv);
        }
      });
      
      console.log(`Total unique conversations: ${combinedResults.length}`);
      
      // Log details about the first few conversations for debugging
      if (combinedResults.length > 0) {
        combinedResults.slice(0, 3).forEach((conv, i) => {
          console.log(`Conversation ${i}: ID=${conv.id}, user_id=${conv.user_id}, is_anonymous=${conv.is_anonymous}, messages=${conv.message_count}`);
        });
      } else {
        console.log('No conversations found for this sim');
      }
      
      return combinedResults;
    },
    enabled: !!sim?.id,
    refetchInterval: 10000, // Refetch every 10 seconds to show new conversations
  });

  const handleConversationClick = (conversation: any) => {
    console.log('Opening conversation:', conversation);
    
    // Add sim data to the conversation object
    const enhancedConversation = {
      ...conversation,
      sim: {
        ...conversation.sim,
        avatar: sim?.avatar,
        avatar_url: sim?.avatar_url
      }
    };
    
    console.log('Enhanced conversation with sim data:', enhancedConversation);
    setSelectedConversation(enhancedConversation);
    setIsChatModalOpen(true);
  };

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Enhanced search that looks through all messages in conversations
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const q = query.trim().toLowerCase();
    const results = [];

    try {
      // Search through each conversation's messages
      for (const conversation of conversations) {
        let matchFound = false;
        
        // First check conversation metadata (ID, latest message)
        const metadataMatch = 
          (conversation.latest_message || '').toLowerCase().includes(q) ||
          (conversation.id || '').toLowerCase().includes(q) ||
          (conversation.title || '').toLowerCase().includes(q);
        
        if (metadataMatch) {
          matchFound = true;
        } else {
          // Search through all messages in the conversation
          try {
            const messages = await conversationService.getMessages(conversation.id);
            const messageMatch = messages.some(msg => 
              msg.content.toLowerCase().includes(q)
            );
            
            if (messageMatch) {
              matchFound = true;
            }
          } catch (error) {
            console.error(`Error searching messages for conversation ${conversation.id}:`, error);
            // Continue with other conversations even if one fails
          }
        }
        
        if (matchFound) {
          results.push(conversation);
        }
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [conversations]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const filteredConversations = useMemo(() => {
    // If there's a search query, use search results; otherwise show all conversations
    return searchQuery.trim() ? searchResults : conversations;
  }, [conversations, searchQuery, searchResults]);

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllVisible = () => {
    setSelectedIds(filteredConversations.map((c: any) => c.id));
  };

  const clearSelection = () => setSelectedIds([]);

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const ok = confirm(`Delete ${selectedIds.length} conversation(s)? This cannot be undone.`);
    if (!ok) return;
    console.log('[Conversations] Bulk delete clicked', selectedIds);
    const success = await conversationService.deleteConversations(selectedIds);
    console.log('[Conversations] Bulk delete result', { success });
    if (success) {
      clearSelection();
      refetch();
    }
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

  // Only show loading state when sim data is loading, not for conversations
  if (isLoading && !sim) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>;
  }

  return <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* All Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Conversations ({conversations.length})
          </CardTitle>

        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
            <div className="flex-1 flex items-center gap-2">
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder="Search through all conversation messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
              {searchQuery.trim() && (
                <div className="text-xs text-muted-foreground">
                  {isSearching ? 'Searching...' : `${filteredConversations.length} found`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">

              <div className="hidden md:block text-xs text-muted-foreground">
                {selectedIds.length > 0 ? `${selectedIds.length} selected` : `${filteredConversations.length} visible`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllVisible}
                disabled={filteredConversations.length === 0 || selectedIds.length === filteredConversations.length}
              >
                Select visible
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                disabled={selectedIds.length === 0}
              >
                Clear
              </Button>
              {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Delete {selectedIds.length}
                </Button>
              )}
            </div>
          </div>
          {conversationsLoading ? (
            <div className="flex justify-end mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
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
              {filteredConversations.map((conversation: any) => (
                <div
                  key={conversation.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors relative cursor-pointer"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent onClick
                      const ok = confirm('Delete this conversation?');
                      if (!ok) return;
                      console.log('[Conversations] Single delete clicked', conversation.id);
                      conversationService.deleteConversation(conversation.id).then(success => {
                        console.log('[Conversations] Single delete result', { id: conversation.id, success });
                        if (success) {
                          refetch();
                        }
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedIds.includes(conversation.id)}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                      }}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        toggleSelected(conversation.id);
                      }}
                    />
                    <div className="flex-1 min-w-0 pr-8"> {/* Added right padding to prevent overlap with delete icon */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {conversation.latest_message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {conversation.message_count} messages
                        </Badge>
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
        simAvatar={sim?.avatar_url || (sim?.avatar ? `/lovable-uploads/${sim?.avatar}` : undefined)}
      />
    </div>;
};

export default MySim;

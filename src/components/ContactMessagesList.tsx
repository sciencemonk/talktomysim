import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContactMessage {
  id: string;
  sender_email: string | null;
  sender_phone: string | null;
  message: string;
  created_at: string;
  read: boolean;
}

interface ContactMessagesListProps {
  advisorId: string;
  editCode?: string;
}

const ContactMessagesList = ({ advisorId, editCode }: ContactMessagesListProps) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [advisorId, editCode]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      // If edit code is provided, use RPC function for secure access
      // Otherwise use regular query (for authenticated owners)
      if (editCode) {
        // Validate edit code before attempting to fetch
        if (!editCode || editCode.length !== 6) {
          console.log('Invalid edit code, skipping fetch');
          setMessages([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .rpc('get_contact_messages_with_code', {
            p_advisor_id: advisorId,
            p_edit_code: editCode
          });

        if (error) {
          console.error('RPC error:', error);
          // If error is about invalid code, show specific message
          if (error.message?.includes('Invalid edit code')) {
            toast({
              title: "Invalid Code",
              description: "Please enter a valid 6-digit edit code",
              variant: "destructive"
            });
          } else {
            throw error;
          }
          setMessages([]);
          setIsLoading(false);
          return;
        }
        setMessages(data || []);
      } else {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .eq('advisor_id', advisorId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      // Use RPC if edit code provided, otherwise regular query
      if (editCode) {
        const { error } = await supabase
          .rpc('delete_contact_message_with_code', {
            p_message_id: messageId,
            p_advisor_id: advisorId,
            p_edit_code: editCode
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_messages')
          .delete()
          .eq('id', messageId);

        if (error) throw error;
      }

      setMessages(messages.filter(m => m.id !== messageId));
      toast({
        title: "Success",
        description: "Message deleted"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      // Use RPC if edit code provided, otherwise regular query
      if (editCode) {
        const { error } = await supabase
          .rpc('mark_contact_message_read_with_code', {
            p_message_id: messageId,
            p_advisor_id: advisorId,
            p_edit_code: editCode
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_messages')
          .update({ read: true })
          .eq('id', messageId);

        if (error) throw error;
      }

      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, read: true } : m
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    // Show different message based on whether edit code is provided
    const message = editCode && editCode.length !== 6 
      ? "Please enter a valid 6-digit edit code above to view messages"
      : "No messages yet";
      
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 rounded-lg border ${
            message.read ? 'bg-background' : 'bg-muted/50'
          }`}
          onClick={() => !message.read && handleMarkAsRead(message.id)}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {!message.read && (
                <Badge variant="default" className="text-xs">New</Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(message.created_at).toLocaleDateString()} at{' '}
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete message?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this message.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(message.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-2 mb-3">
            {message.sender_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${message.sender_email}`}
                  className="text-primary hover:underline"
                >
                  {message.sender_email}
                </a>
              </div>
            )}
            {message.sender_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${message.sender_phone}`}
                  className="text-primary hover:underline"
                >
                  {message.sender_phone}
                </a>
              </div>
            )}
          </div>

          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ContactMessagesList;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SimAction {
  id: string;
  sim_id: string;
  description: string;
  end_goal: string;
  usdc_amount: number;
  created_at: string;
  updated_at: string;
}

// Helper to check if a string is a valid UUID
const isValidUUID = (str: string | undefined): boolean => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useSimActions = (simId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["sim-actions", simId],
    queryFn: async () => {
      if (!simId || !isValidUUID(simId)) return [];

      const { data, error } = await supabase
        .from("sim_actions")
        .select("*")
        .eq("sim_id", simId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as SimAction[];
    },
    enabled: !!simId && isValidUUID(simId),
  });

  const deleteAction = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("sim_actions")
        .delete()
        .eq("id", actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sim-actions", simId] });
      toast({
        title: "Action deleted",
        description: "The action has been removed successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting action:", error);
      toast({
        title: "Error",
        description: "Failed to delete action. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    actions,
    isLoading,
    deleteAction: deleteAction.mutate,
  };
};

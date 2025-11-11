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

export const useSimActions = (simId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["sim-actions", simId],
    queryFn: async () => {
      if (!simId) return [];

      const { data, error } = await supabase
        .from("sim_actions")
        .select("*")
        .eq("sim_id", simId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as SimAction[];
    },
    enabled: !!simId,
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

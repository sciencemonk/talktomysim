import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UnifiedAgentCreation } from "./UnifiedAgentCreation";

export const SimLeaderboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg hover:shadow-xl transition-all z-50 font-bold text-base"
        style={{ backgroundColor: '#82f2aa', color: '#000' }}
        onClick={() => setShowCreateModal(true)}
      >
        Create Agent
      </Button>

      <UnifiedAgentCreation
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
        }}
      />
    </>
  );
};

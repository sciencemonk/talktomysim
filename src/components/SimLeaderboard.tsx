import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

      {showCreateModal && (
        <Dialog open={true} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Choose Agent Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button
                onClick={() => {
                  window.location.href = '/?create=sim';
                }}
                className="w-full gap-2"
                style={{ backgroundColor: '#83f1aa', color: '#000' }}
              >
                Create Sim
              </Button>
              <Button
                onClick={() => {
                  window.location.href = '/?create=pumpfun';
                }}
                variant="outline"
                className="w-full gap-2"
              >
                Create PumpFun Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

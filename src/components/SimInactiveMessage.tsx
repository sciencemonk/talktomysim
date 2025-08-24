
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Power } from "lucide-react";

const SimInactiveMessage = () => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-0 p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Bot className="h-16 w-16 text-muted-foreground" />
              <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                <Power className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Sim is Currently Off</h2>
          <p className="text-muted-foreground">
            This Sim has been temporarily disabled by its creator and is not available for conversations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimInactiveMessage;

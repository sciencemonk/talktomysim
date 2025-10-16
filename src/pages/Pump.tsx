import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TopNavigation from "@/components/TopNavigation";
import SimpleFooter from "@/components/SimpleFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Sparkles, Send } from "lucide-react";
import { motion } from "framer-motion";
import debateIcon from "@/assets/debate-icon.png";

interface Sim {
  id: string;
  name: string;
  avatar_url: string | null;
  description: string | null;
}

const Pump = () => {
  const [sims, setSims] = useState<Sim[]>([]);
  const [selectedSim1, setSelectedSim1] = useState<string>("");
  const [selectedSim2, setSelectedSim2] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [voterName, setVoterName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    fetchSims();
    fetchQueueCount();
  }, []);

  const fetchSims = async () => {
    const { data, error } = await supabase
      .from("advisors")
      .select("id, name, avatar_url, description")
      .eq("is_verified", true)
      .eq("sim_type", "historical")
      .order("name");

    if (error) {
      console.error("Error fetching sims:", error);
      toast.error("Failed to load sims");
      return;
    }

    setSims(data || []);
  };

  const fetchQueueCount = async () => {
    const { count, error } = await supabase
      .from("debate_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (!error) {
      setQueueCount(count || 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSim1 || !selectedSim2) {
      toast.error("Please select two different sims");
      return;
    }

    if (selectedSim1 === selectedSim2) {
      toast.error("Please select two different sims");
      return;
    }

    if (!topic.trim()) {
      toast.error("Please enter a debate topic");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("debate_queue")
      .insert({
        sim1_id: selectedSim1,
        sim2_id: selectedSim2,
        topic: topic.trim(),
        voter_name: voterName.trim() || null,
      });

    if (error) {
      console.error("Error submitting debate:", error);
      toast.error("Failed to submit debate");
      setIsSubmitting(false);
      return;
    }

    toast.success("Debate added to queue! Watch /live to see it happen");
    setSelectedSim1("");
    setSelectedSim2("");
    setTopic("");
    setVoterName("");
    setIsSubmitting(false);
    fetchQueueCount();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <img 
              src={debateIcon} 
              alt="Debate" 
              className="h-16 w-16 mx-auto"
            />
            <h1 className="text-4xl font-bold">Pump a Debate</h1>
            <p className="text-muted-foreground text-lg">
              Choose two sims and a topic - watch them debate live at /live
            </p>
            {queueCount > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{queueCount} debates in queue</span>
              </div>
            )}
          </div>

          {/* Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sim 1 Selection */}
              <div className="space-y-2">
                <Label htmlFor="sim1">First Sim</Label>
                <select
                  id="sim1"
                  value={selectedSim1}
                  onChange={(e) => setSelectedSim1(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  <option value="">Select a sim...</option>
                  {sims.map((sim) => (
                    <option key={sim.id} value={sim.id} disabled={sim.id === selectedSim2}>
                      {sim.name}
                    </option>
                  ))}
                </select>
                {selectedSim1 && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={sims.find(s => s.id === selectedSim1)?.avatar_url || ""} />
                      <AvatarFallback>{sims.find(s => s.id === selectedSim1)?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{sims.find(s => s.id === selectedSim1)?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sims.find(s => s.id === selectedSim1)?.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sim 2 Selection */}
              <div className="space-y-2">
                <Label htmlFor="sim2">Second Sim</Label>
                <select
                  id="sim2"
                  value={selectedSim2}
                  onChange={(e) => setSelectedSim2(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  <option value="">Select a sim...</option>
                  {sims.map((sim) => (
                    <option key={sim.id} value={sim.id} disabled={sim.id === selectedSim1}>
                      {sim.name}
                    </option>
                  ))}
                </select>
                {selectedSim2 && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={sims.find(s => s.id === selectedSim2)?.avatar_url || ""} />
                      <AvatarFallback>{sims.find(s => s.id === selectedSim2)?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{sims.find(s => s.id === selectedSim2)?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sims.find(s => s.id === selectedSim2)?.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Topic Input */}
              <div className="space-y-2">
                <Label htmlFor="topic">Debate Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What should they debate about?"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {topic.length}/200 characters
                </p>
              </div>

              {/* Optional Name */}
              <div className="space-y-2">
                <Label htmlFor="voterName">Your Name (Optional)</Label>
                <Input
                  id="voterName"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="Want credit for this debate?"
                  maxLength={50}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Add to Queue
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Choose two sims from our historical figures</li>
              <li>• Pick any topic you want them to debate</li>
              <li>• Your debate gets added to the queue</li>
              <li>• Watch it happen live at /live</li>
            </ul>
          </Card>
        </motion.div>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default Pump;

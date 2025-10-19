import { useState, useEffect, useRef } from "react";
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
import { getAvatarUrl } from "@/lib/avatarUtils";

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
  const [mathAnswer, setMathAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [mathQuestion, setMathQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchSims();
    fetchQueueCount();
    generateMathQuestion();

    // Try to play audio after user interaction
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log("Autoplay prevented:", err);
        });
      }
    };

    // Try to play immediately
    playAudio();

    // Also try on first click anywhere
    const handleFirstClick = () => {
      playAudio();
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);

    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setMathQuestion({ num1, num2, answer: num1 + num2 });
    setMathAnswer("");
  };

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

    // Verify math answer
    if (parseInt(mathAnswer) !== mathQuestion.answer) {
      toast.error("Incorrect answer to the math question");
      generateMathQuestion(); // Generate new question
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("debate_queue")
      .insert({
        sim1_id: selectedSim1,
        sim2_id: selectedSim2,
        topic: topic.trim(),
        voter_name: null,
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
    setMathAnswer("");
    setIsSubmitting(false);
    fetchQueueCount();
    generateMathQuestion();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <audio 
        ref={audioRef}
        src="/simmusic.m4a"
        loop
        className="hidden"
      />
      <TopNavigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Info Card */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Choose two sims from our historical figures</li>
              <li>• Pick any topic you want them to debate</li>
              <li>• Solve a simple math question to prove you're human</li>
              <li>• Your debate gets added to the queue</li>
              <li>
                • Watch it happen live on{" "}
                <a 
                  href="https://pump.fun/coin/FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Pump Fun
                </a>
              </li>
            </ul>
            {queueCount > 0 && (
              <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-background border border-primary/20 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{queueCount} debates in queue</span>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-border">
              <Button 
                asChild 
                variant="outline" 
                className="w-full"
              >
                <a href="/livestream">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Watch AI Livestream Commentary
                </a>
              </Button>
            </div>
          </Card>

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
                      <AvatarImage src={getAvatarUrl(sims.find(s => s.id === selectedSim1)?.avatar_url) || ""} />
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
                      <AvatarImage src={getAvatarUrl(sims.find(s => s.id === selectedSim2)?.avatar_url) || ""} />
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

              {/* Math Verification */}
              <div className="space-y-2">
                <Label htmlFor="mathAnswer">Verify you're human</Label>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">
                    What is {mathQuestion.num1} + {mathQuestion.num2}?
                  </span>
                </div>
                <Input
                  id="mathAnswer"
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  required
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
        </motion.div>
      </div>

      <SimpleFooter />
    </div>
  );
};

export default Pump;

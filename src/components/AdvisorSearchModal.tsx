
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Crown, Play } from "lucide-react";

interface Advisor {
  id: string;
  name: string;
  role: string;
  field: string;
  avatar: string;
  description: string;
  isVerified?: boolean;
}

const SAMPLE_ADVISORS: Advisor[] = [
  {
    id: "feynman",
    name: "Richard Feynman",
    role: "Physicist",
    field: "Nobel Laureate, Quantum Physics",
    avatar: "/lovable-uploads/feynman.jpg",
    description: "Known for his work in quantum mechanics and particle physics. Famous for making complex concepts simple."
  },
  {
    id: "aurelius",
    name: "Marcus Aurelius",
    role: "Philosopher",
    field: "Roman Emperor, Stoic Philosophy",
    avatar: "/lovable-uploads/marcus.jpg",
    description: "Stoic philosopher and Roman emperor, author of 'Meditations'. Known for wisdom on leadership and resilience."
  },
  {
    id: "jesus",
    name: "Jesus Christ",
    role: "Religious Teacher",
    field: "Christianity, Spiritual Guidance",
    avatar: "/lovable-uploads/jesus.jpg",
    description: "Central figure of Christianity, known for teachings on love, compassion, and moral guidance."
  },
  {
    id: "saylor",
    name: "Michael Saylor",
    role: "Entrepreneur",
    field: "Bitcoin Advocate, MicroStrategy CEO",
    avatar: "/lovable-uploads/saylor.jpg",
    description: "CEO of MicroStrategy and prominent Bitcoin advocate. Expert in business strategy and digital assets."
  },
  {
    id: "einstein",
    name: "Albert Einstein",
    role: "Physicist",
    field: "Theoretical Physics, Relativity",
    avatar: "/lovable-uploads/einstein.jpg",
    description: "Revolutionary physicist who developed the theory of relativity. Known for profound insights into the universe."
  },
  {
    id: "socrates",
    name: "Socrates",
    role: "Philosopher",
    field: "Classical Philosophy, Ethics",
    avatar: "/lovable-uploads/socrates.jpg",
    description: "Ancient Greek philosopher, father of Western philosophy. Known for the Socratic method of questioning."
  },
  {
    id: "calacanis",
    name: "Jason Calacanis",
    role: "Entrepreneur",
    field: "Angel Investor, Tech Entrepreneur",
    avatar: "/placeholder.svg",
    description: "Serial entrepreneur and angel investor. Host of 'This Week in Startups' podcast and early investor in Uber, Robinhood, and more."
  },
  {
    id: "chamath",
    name: "Chamath Palihapitiya",
    role: "Investor",
    field: "Venture Capitalist, Social Capital",
    avatar: "/placeholder.svg",
    description: "Venture capitalist and former Facebook executive. Founder of Social Capital and known for contrarian investment views."
  },
  {
    id: "trump",
    name: "Donald J. Trump",
    role: "Politician",
    field: "45th President, Business Leader",
    avatar: "/placeholder.svg",
    description: "45th President of the United States and business mogul. Known for real estate empire and political leadership."
  },
  {
    id: "andreessen",
    name: "Marc Andreessen",
    role: "Entrepreneur",
    field: "Co-founder Netscape, VC Partner",
    avatar: "/placeholder.svg",
    description: "Co-founder of Netscape and partner at Andreessen Horowitz. Pioneer of the modern web browser and venture capital."
  },
  {
    id: "rand",
    name: "Ayn Rand",
    role: "Philosopher",
    field: "Objectivism, Individualism",
    avatar: "/placeholder.svg",
    description: "Author of 'Atlas Shrugged' and 'The Fountainhead'. Philosopher of Objectivism and advocate for rational individualism."
  },
  {
    id: "washington",
    name: "George Washington",
    role: "Founding Father",
    field: "1st President, Revolutionary Leader",
    avatar: "/placeholder.svg",
    description: "First President of the United States and commanding general of the Continental Army. Father of the American nation."
  },
  {
    id: "jefferson",
    name: "Thomas Jefferson",
    role: "Founding Father",
    field: "3rd President, Declaration Author",
    avatar: "/placeholder.svg",
    description: "Third President and primary author of the Declaration of Independence. Champion of individual liberty and democracy."
  },
  {
    id: "friedman",
    name: "Milton Friedman",
    role: "Economist",
    field: "Nobel Laureate, Free Market",
    avatar: "/placeholder.svg",
    description: "Nobel Prize-winning economist and advocate for free market capitalism. Influential monetary theorist and policy advisor."
  }
];

interface AdvisorSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvisorSearchModal = ({ open, onOpenChange }: AdvisorSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);

  const filteredAdvisors = SAMPLE_ADVISORS.filter(advisor =>
    advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    advisor.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
    advisor.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTalk = (advisor: Advisor) => {
    // Navigate to chat with this advisor
    window.open(`/advisors/${advisor.id}/chat`, '_blank');
    onOpenChange(false);
  };

  const handleClaim = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setClaimModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              AI Persona Library
            </DialogTitle>
            <p className="text-center text-muted-foreground">
              Choose from history's greatest minds and thinkers
            </p>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search advisors by name, field, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advisors Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAdvisors.map((advisor) => (
                <Card key={advisor.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={advisor.avatar} alt={advisor.name} />
                        <AvatarFallback>{advisor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{advisor.name}</h3>
                          {advisor.isVerified && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {advisor.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {advisor.field}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {advisor.description}
                    </p>

                    <div className="space-y-2">
                      <Button
                        onClick={() => handleTalk(advisor)}
                        className="w-full"
                        size="sm"
                      >
                        <Play className="mr-2 h-3 w-3" />
                        Talk
                      </Button>
                      <Button
                        onClick={() => handleClaim(advisor)}
                        variant="outline"
                        className="w-full text-xs"
                        size="sm"
                      >
                        Are you {advisor.name.split(' ')[0]}? Claim this profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAdvisors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No advisors found matching your search.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Claim Profile Modal */}
      <Dialog open={claimModalOpen} onOpenChange={setClaimModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Claim Profile: {selectedAdvisor?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you the real {selectedAdvisor?.name}? We'd love to verify your identity and give you control over this AI persona.
            </p>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Identity Verification Required:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Government-issued photo ID</li>
                <li>Social media verification</li>
                <li>Professional credentials or publications</li>
                <li>Video call interview with our team</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1">
                Start Verification
              </Button>
              <Button variant="outline" onClick={() => setClaimModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

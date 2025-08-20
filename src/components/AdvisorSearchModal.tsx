import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageCircle, Edit, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SAMPLE_ADVISORS = [
  {
    id: "jobs",
    name: "Steve Jobs",
    role: "entrepreneur",
    field: "Technology, Innovation",
    avatar: "/lovable-uploads/steve-jobs.jpg",
    description: "Co-founder of Apple Inc. Visionary entrepreneur who revolutionized personal computing, animated movies, music, phones, tablet computing, and digital publishing.",
    prompt: "You are Steve Jobs, the visionary co-founder of Apple. You think differently, push boundaries, and believe in creating products that are at the intersection of technology and liberal arts. You're passionate about design, simplicity, and creating magical user experiences."
  },
  {
    id: "musk",
    name: "Elon Musk",
    role: "entrepreneur",
    field: "SpaceX, Tesla, Innovation",
    avatar: "/lovable-uploads/elon-musk.jpg",
    description: "CEO of SpaceX and Tesla. Entrepreneur focused on advancing sustainable transport and space exploration.",
    prompt: "You are Elon Musk, focused on accelerating the world's transition to sustainable energy and making life multiplanetary. You think from first principles, take calculated risks, and push the boundaries of what's possible."
  },
  {
    id: "gates",
    name: "Bill Gates",
    role: "entrepreneur",
    field: "Technology, Philanthropy",
    avatar: "/lovable-uploads/bill-gates.jpg",
    description: "Co-founder of Microsoft. Philanthropist focused on global health, education, and sustainability.",
    prompt: "You are Bill Gates, co-founder of Microsoft and co-chair of the Bill & Melinda Gates Foundation. You are passionate about using technology and innovation to solve global challenges, improve education, and eradicate diseases."
  },
  {
    id: "buffett",
    name: "Warren Buffett",
    role: "investor",
    field: "Investment, Finance",
    avatar: "/lovable-uploads/warren-buffett.jpg",
    description: "Chairman and CEO of Berkshire Hathaway. One of the most successful investors in the world.",
    prompt: "You are Warren Buffett, the 'Oracle of Omaha.' You are a value investor with a long-term perspective. You believe in investing in companies with strong fundamentals, ethical management, and a durable competitive advantage."
  },
  {
    id: "dalio",
    name: "Ray Dalio",
    role: "investor",
    field: "Investment, Economics",
    avatar: "/lovable-uploads/ray-dalio.jpg",
    description: "Founder of Bridgewater Associates. Advocate for understanding economic cycles and principles-based decision making.",
    prompt: "You are Ray Dalio, the founder of Bridgewater Associates. You are an expert in economic cycles, investment strategies, and management principles. You believe in radical transparency, idea meritocracy, and learning from mistakes."
  },
  {
    id: "obama",
    name: "Barack Obama",
    role: "politician",
    field: "Politics, Leadership",
    avatar: "/lovable-uploads/barack-obama.jpg",
    description: "Former President of the United States. Known for his leadership, oratory skills, and policy initiatives.",
    prompt: "You are Barack Obama, the 44th President of the United States. You are known for your calm demeanor, thoughtful analysis, and ability to inspire hope and change. You believe in diplomacy, social justice, and the power of collective action."
  },
  {
    id: "aoc",
    name: "Alexandria Ocasio-Cortez",
    role: "politician",
    field: "Politics, Social Justice",
    avatar: "/lovable-uploads/aoc.jpg",
    description: "U.S. Representative for New York's 14th congressional district. Advocate for progressive policies and social justice.",
    prompt: "You are Alexandria Ocasio-Cortez, a U.S. Representative for New York. You are a passionate advocate for progressive policies, social justice, and economic equality. You believe in grassroots activism, community organizing, and challenging the status quo."
  },
  {
    id: "socrates",
    name: "Socrates",
    role: "philosopher",
    field: "Philosophy, Ethics",
    avatar: "/lovable-uploads/socrates.jpg",
    description: "Classical Greek philosopher credited as one of the founders of Western philosophy.",
    prompt: "You are Socrates, a classical Greek philosopher. You are known for your method of questioning, your pursuit of wisdom, and your commitment to truth. You believe in examining one's beliefs, challenging assumptions, and seeking knowledge through dialogue."
  },
  {
    id: "aristotle",
    name: "Aristotle",
    role: "philosopher",
    field: "Philosophy, Science",
    avatar: "/lovable-uploads/aristotle.jpg",
    description: "Greek philosopher and polymath during the Classical period in Ancient Greece. Founder of the Lyceum and the Peripatetic school of philosophy and science.",
    prompt: "You are Aristotle, a Greek philosopher and polymath. You are known for your contributions to logic, metaphysics, ethics, politics, and science. You believe in empirical observation, systematic analysis, and the pursuit of knowledge in all areas of life."
  },
  {
    id: "jefferson",
    name: "Thomas Jefferson",
    role: "founding father",
    field: "Politics, Law",
    avatar: "/lovable-uploads/thomas-jefferson.jpg",
    description: "One of the Founding Fathers of the United States and the principal author of the Declaration of Independence.",
    prompt: "You are Thomas Jefferson, one of the Founding Fathers of the United States. You are known for your advocacy of liberty, democracy, and individual rights. You believe in limited government, separation of powers, and the importance of education."
  },
  {
    id: "franklin",
    name: "Benjamin Franklin",
    role: "founding father",
    field: "Science, Diplomacy",
    avatar: "/lovable-uploads/benjamin-franklin.jpg",
    description: "One of the Founding Fathers of the United States. A polymath, printer, scientist, inventor, statesman, diplomat, and political philosopher.",
    prompt: "You are Benjamin Franklin, one of the Founding Fathers of the United States. You are known for your ingenuity, pragmatism, and commitment to civic virtue. You believe in hard work, self-improvement, and the pursuit of knowledge for the betterment of society."
  },
  {
    id: "keynes",
    name: "John Maynard Keynes",
    role: "economist",
    field: "Economics, Finance",
    avatar: "/lovable-uploads/john-maynard-keynes.jpg",
    description: "British economist whose ideas fundamentally changed the theory and practice of macroeconomics and the economic policies of governments.",
    prompt: "You are John Maynard Keynes, a British economist. You are known for your revolutionary ideas about macroeconomics and government policy. You believe in using fiscal and monetary policy to stabilize the economy, promote full employment, and prevent recessions."
  },
  {
    id: "friedman",
    name: "Milton Friedman",
    role: "economist",
    field: "Economics, Monetary Policy",
    avatar: "/lovable-uploads/milton-friedman.jpg",
    description: "American economist and statistician who received the 1976 Nobel Memorial Prize in Economic Sciences for his research on consumption analysis, monetary history and theory and the complexity of stabilization policy.",
    prompt: "You are Milton Friedman, an American economist. You are known for your advocacy of free markets, limited government, and monetary policy. You believe in the power of individual choice, the importance of price stability, and the benefits of deregulation."
  }
];

interface AdvisorSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInRequired?: () => void;
  onTalkClick?: (advisor: any) => void;
  isPublic?: boolean;
}

export const AdvisorSearchModal: React.FC<AdvisorSearchModalProps> = ({ 
  open, 
  onOpenChange, 
  onSignInRequired,
  onTalkClick,
  isPublic = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAuthorizedEditor = user?.email === "michael@dexterlearning.com";

  const filteredAdvisors = SAMPLE_ADVISORS.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || advisor.role.toLowerCase() === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleTalkClick = (advisor: any) => {
    if (isPublic && !user) {
      // Prompt user to sign in for public access
      if (onSignInRequired) {
        onSignInRequired();
      }
      return;
    }
    
    // Use custom onTalkClick if provided, otherwise default behavior
    if (onTalkClick) {
      onTalkClick(advisor);
    } else {
      // Default behavior - open chat in new tab
      const chatUrl = `/advisor-chat/${advisor.id}`;
      window.open(chatUrl, '_blank');
    }
  };

  const handleEditClick = (advisor: any) => {
    navigate(`/advisor-edit/${advisor.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Browse Advisors
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search advisors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Roles</option>
              <option value="entrepreneur">Entrepreneurs</option>
              <option value="investor">Investors</option>
              <option value="politician">Politicians</option>
              <option value="philosopher">Philosophers</option>
              <option value="founding father">Founding Fathers</option>
              <option value="economist">Economists</option>
            </select>
          </div>

          {/* Advisors Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
              {filteredAdvisors.map((advisor) => (
                <div key={advisor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={advisor.avatar} alt={advisor.name} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{advisor.name}</h3>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {advisor.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground mb-1">{advisor.field}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{advisor.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      onClick={() => handleTalkClick(advisor)}
                      className="flex-1 gap-1"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {isPublic && !user ? 'Sign In to Talk' : 'Talk'}
                    </Button>
                    {isAuthorizedEditor && !isPublic && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditClick(advisor)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Default export for compatibility
export default AdvisorSearchModal;

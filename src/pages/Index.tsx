
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Wallet, Users } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to the main app
  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
            alt="Think With Me" 
            className="h-8 w-8"
          />
          <h1 className="font-bold text-xl">Think With Me</h1>
        </div>
        <Link to="/login">
          <Button variant="outline">Sign In</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            The Future of AI is Personal
            <span className="block text-primary">Not Generic</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            ChatGPT is one-size-fits-all. Sim is uniquely yours. Create your own AI—a personal assistant, 
            financial advisor, or trusted friend. Connect your crypto wallet, customize personality and knowledge, 
            and build an AI that truly understands you.
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link to="/login">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-xl bg-white shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Your AI, Your Way</h3>
              <p className="text-gray-600">
                Customize your Sim's personality, knowledge base, and capabilities to match your needs and style.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Crypto-Connected</h3>
              <p className="text-gray-600">
                Connect your crypto wallet for a truly personalized financial advisor that understands your portfolio.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white shadow-sm border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Truly Personal</h3>
              <p className="text-gray-600">
                Unlike generic AI, your Sim learns your preferences, context, and goals to provide genuinely personalized assistance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

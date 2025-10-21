import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Wallet, Users } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();

  // Add SimAI Helper chat widget
  useEffect(() => {
    // Prevent duplicate loading
    if (window.__SIM_CHAT_LOADED__ === true) {
      console.log('[SimChat] Already loaded, skipping initialization');
      return;
    }
    
    // Cleanup any existing widgets
    const cleanupExistingWidget = () => {
      const existingBubble = document.getElementById('sim-chat-bubble');
      const existingWindow = document.getElementById('sim-chat-window');
      const existingStyles = document.getElementById('sim-chat-widget-styles');
      
      if (existingBubble) existingBubble.remove();
      if (existingWindow) existingWindow.remove();
      if (existingStyles) existingStyles.remove();
    };
    
    cleanupExistingWidget();
    window.__SIM_CHAT_LOADED__ = true;

    const simConfig = {
      name: "SimAI Helper",
      avatar: "https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/public/avatars/avatars/5fc73de1-9e91-4e0d-8e4a-f2fc587e7f69-1761073373654.jpg",
      simUrl: "https://ba4e5241-6f09-4c12-a26a-0a6d8ff72241.lovableproject.com/simai-helper?embed=chat-only",
      welcomeMessage: "Hey there! I'm SimAI Helper, your go-to for all things related to SimProject.org—ask me anything about our product, the $SIMAI token, or how to make the most of our platform. Just type your question, and let's get started!"
    };
    
    // Create styles
    const style = document.createElement('style');
    style.id = 'sim-chat-widget-styles';
    style.textContent = `
      #sim-chat-bubble {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: transform 0.3s ease;
      }
      #sim-chat-bubble:hover { transform: scale(1.1); }
      #sim-chat-bubble img {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
      }
      #sim-chat-window {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 600px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 120px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        background: white;
        z-index: 9998;
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      #sim-chat-window.active { display: flex; }
      #sim-chat-header {
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      #sim-chat-close {
        margin-left: auto;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #sim-chat-iframe {
        flex: 1;
        border: none;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
    
    // Create bubble
    const bubble = document.createElement('div');
    bubble.id = 'sim-chat-bubble';
    bubble.innerHTML = '<img src="' + simConfig.avatar + '" alt="' + simConfig.name + '" draggable="false">';
    document.body.appendChild(bubble);
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'sim-chat-window';
    chatWindow.innerHTML = `
      <div id="sim-chat-header">
        <strong>${simConfig.name}</strong>
        <button id="sim-chat-close">×</button>
      </div>
      <iframe id="sim-chat-iframe" src="${simConfig.simUrl}"></iframe>
    `;
    document.body.appendChild(chatWindow);
    
    // Toggle chat window on bubble click
    bubble.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      chatWindow.classList.toggle('active');
    });
    
    // Close button
    const closeBtn = document.getElementById('sim-chat-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        chatWindow.classList.remove('active');
      });
    }
    
    console.log('[SimChat] Widget initialized successfully');

    // Cleanup on unmount
    return () => {
      cleanupExistingWidget();
      window.__SIM_CHAT_LOADED__ = false;
    };
  }, []);

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
            src="/lovable-uploads/55ccce33-98a1-45d2-9e9e-7b446a02a417.png" 
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

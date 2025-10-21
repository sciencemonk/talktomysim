import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card } from '@/components/ui/card';

export const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
          <p className="text-white">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-black">
        <AppSidebar />
        
        {/* Main Content Area - No extra header */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

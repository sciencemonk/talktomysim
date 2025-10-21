import { useEffect } from "react";

// Extend Window interface for the chat widget flag
declare global {
  interface Window {
    __SIM_CHAT_LOADED__?: boolean;
  }
}

const Test = () => {
  useEffect(() => {
    // Inject the embedded chat widget script
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        'use strict';
        
        // ULTRA AGGRESSIVE DUPLICATE PREVENTION
        if (window.__SIM_CHAT_LOADED__ === true) {
          console.log('[SimChat] Already loaded, skipping initialization');
          return;
        }
        
        // Cleanup any existing widgets
        function cleanupExistingWidget() {
          const existingBubble = document.getElementById('sim-chat-bubble');
          const existingWindow = document.getElementById('sim-chat-window');
          const existingStyles = document.getElementById('sim-chat-widget-styles');
          
          if (existingBubble) existingBubble.remove();
          if (existingWindow) existingWindow.remove();
          if (existingStyles) existingStyles.remove();
        }
        
        cleanupExistingWidget();
        window.__SIM_CHAT_LOADED__ = true;

        const simConfig = {
          name: "SimAI Helper",
          avatar: "https://uovhemqkztmkoozlmqxq.supabase.co/storage/v1/object/public/avatars/avatars/5fc73de1-9e91-4e0d-8e4a-f2fc587e7f69-1761073373654.jpg",
          simUrl: "https://simproject.org/simai-helper?embed=chat-only",
          welcomeMessage: "Hey there! I'm SimAI Helper, your go-to for all things related to SimProject.org—ask me anything about our product, the $SIMAI token, or how to make the most of our platform. Just type your question, and let's get started!"
        };
        
        // Create styles
        const style = document.createElement('style');
        style.id = 'sim-chat-widget-styles';
        style.textContent = \`
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
        \`;
        document.head.appendChild(style);
        
        // Create bubble
        const bubble = document.createElement('div');
        bubble.id = 'sim-chat-bubble';
        bubble.innerHTML = '<img src="' + simConfig.avatar + '" alt="' + simConfig.name + '" draggable="false">';
        document.body.appendChild(bubble);
        
        // Create chat window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'sim-chat-window';
        chatWindow.innerHTML = \`
          <div id="sim-chat-header">
            <strong>\${simConfig.name}</strong>
            <button id="sim-chat-close">×</button>
          </div>
          <iframe id="sim-chat-iframe" src="\${simConfig.simUrl}"></iframe>
        \`;
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
      })();
    `;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      window.__SIM_CHAT_LOADED__ = false;
      const existingBubble = document.getElementById('sim-chat-bubble');
      const existingWindow = document.getElementById('sim-chat-window');
      const existingStyles = document.getElementById('sim-chat-widget-styles');
      
      if (existingBubble) existingBubble.remove();
      if (existingWindow) existingWindow.remove();
      if (existingStyles) existingStyles.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-card/50 border-2 border-border rounded-3xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold mb-4">Embedded Chat Widget Test Page</h1>
          <p className="text-muted-foreground mb-6">
            This page tests the SimAI Helper embedded chat widget. Look for the chat bubble in the bottom right corner.
          </p>
          
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-accent/10 rounded-lg border border-border">
              <h2 className="font-semibold mb-2">Test Instructions:</h2>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Look for the purple chat bubble in the bottom right corner</li>
                <li>Click the bubble to open the chat interface</li>
                <li>Verify that the SimAI Helper loads without requiring login</li>
                <li>Test sending messages in the chat</li>
                <li>Close the chat window by clicking the × button or clicking outside</li>
              </ol>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h2 className="font-semibold mb-2">Widget Configuration:</h2>
              <ul className="space-y-1 text-muted-foreground">
                <li><strong>Name:</strong> SimAI Helper</li>
                <li><strong>URL:</strong> https://simproject.org/simai-helper?embed=chat-only</li>
                <li><strong>Position:</strong> Bottom right corner</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              This is a test page for production testing. Visit <a href="/" className="text-primary hover:underline">homepage</a> to return.
            </p>
          </div>
        </div>
      </div>

      {/* Widget container */}
      <div id="sim-chat-widget"></div>
    </div>
  );
};

export default Test;

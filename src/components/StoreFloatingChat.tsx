import { useState } from 'react';
import OpenAIVoiceInterface from './OpenAIVoiceInterface';
import { useStoreChat } from '@/contexts/StoreChatContext';

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  productId?: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_urls?: string[];
};

type StoreFloatingChatProps = {
  store: {
    id: string;
    store_name: string;
    avatar_url?: string;
    agent_prompt?: string;
  };
  chatMessages: ChatMessage[];
  chatMessage: string;
  setChatMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  products: Product[];
  onViewProduct?: (productId: string) => void;
};

export const StoreFloatingChat = ({
  store,
  chatMessages,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  isSending,
  products,
  onViewProduct,
}: StoreFloatingChatProps) => {
  const { isVoiceActive, setIsVoiceActive } = useStoreChat();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAddMessage = (role: 'user' | 'agent', content: string, productId?: string) => {
    console.log('Voice message:', { role, content, productId });
  };

  const handleToggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
  };
  
  return (
    <>
      {/* Floating Voice Agent Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1">
        <button
          onClick={handleToggleVoice}
          className={`group relative h-16 w-16 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${
            isVoiceActive 
              ? 'bg-gradient-to-br from-primary to-primary/80' 
              : 'bg-muted border-2 border-border'
          }`}
        >
          {isVoiceActive && (
            <>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
            </>
          )}
          
          {/* Sound wave visualization */}
          <div className="relative flex gap-0.5 items-end h-8">
            <div className={`w-1 rounded-full ${isVoiceActive ? 'bg-white animate-[pulse_0.6s_ease-in-out_infinite]' : 'bg-muted-foreground'}`} style={{ height: '30%' }} />
            <div className={`w-1 rounded-full ${isVoiceActive ? 'bg-white animate-[pulse_0.6s_ease-in-out_0.1s_infinite]' : 'bg-muted-foreground'}`} style={{ height: '70%' }} />
            <div className={`w-1 rounded-full ${isVoiceActive ? 'bg-white animate-[pulse_0.6s_ease-in-out_0.2s_infinite]' : 'bg-muted-foreground'}`} style={{ height: '50%' }} />
            <div className={`w-1 rounded-full ${isVoiceActive ? 'bg-white animate-[pulse_0.6s_ease-in-out_0.3s_infinite]' : 'bg-muted-foreground'}`} style={{ height: '90%' }} />
            <div className={`w-1 rounded-full ${isVoiceActive ? 'bg-white animate-[pulse_0.6s_ease-in-out_0.2s_infinite]' : 'bg-muted-foreground'}`} style={{ height: '50%' }} />
            <div className={`w-1 rounded-full ${isVoiceActive ? 'bg-white animate-[pulse_0.6s_ease-in-out_0.1s_infinite]' : 'bg-muted-foreground'}`} style={{ height: '70%' }} />
            <div className={`w-1 rounded-full ${isVoiceActive ? 'bg-white animate-[pulse_0.6s_ease-in-out_infinite]' : 'bg-muted-foreground'}`} style={{ height: '30%' }} />
          </div>
        </button>
        <span className="text-[10px] text-muted-foreground/60">Powered by SIM</span>
      </div>

      {/* Voice Interface (only active when enabled) */}
      {isVoiceActive && (
        <OpenAIVoiceInterface
          storeId={store.id}
          onTranscript={handleAddMessage}
          onShowProduct={onViewProduct}
          autoStart={true}
          onSpeakingChange={setIsSpeaking}
        />
      )}
    </>
  );
};

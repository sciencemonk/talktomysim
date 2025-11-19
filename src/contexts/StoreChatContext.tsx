import React, { createContext, useContext, useState, ReactNode } from 'react';

type StoreChatContextType = {
  isVoiceActive: boolean;
  setIsVoiceActive: (active: boolean) => void;
  currentStoreId: string | null;
  setCurrentStoreId: (id: string | null) => void;
};

const StoreChatContext = createContext<StoreChatContextType | undefined>(undefined);

export const StoreChatProvider = ({ children }: { children: ReactNode }) => {
  const [isVoiceActive, setIsVoiceActive] = useState(true); // Voice on by default
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);

  return (
    <StoreChatContext.Provider
      value={{
        isVoiceActive,
        setIsVoiceActive,
        currentStoreId,
        setCurrentStoreId,
      }}
    >
      {children}
    </StoreChatContext.Provider>
  );
};

export const useStoreChat = () => {
  const context = useContext(StoreChatContext);
  if (!context) {
    throw new Error('useStoreChat must be used within StoreChatProvider');
  }
  return context;
};

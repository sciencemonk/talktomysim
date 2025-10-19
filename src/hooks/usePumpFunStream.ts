import { useState, useEffect, useCallback, useRef } from 'react';

interface TradeEvent {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  market_cap_sol: number;
}

interface StreamEvent {
  txType: string;
  signature: string;
  mint: string;
  solAmount: number;
  tokenAmount: number;
  isBuy: boolean;
  user: string;
  timestamp: number;
  marketCapSol: number;
}

export const usePumpFunStream = (subscribeToNewTokens = false) => {
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestTrade, setLatestTrade] = useState<TradeEvent | null>(null);
  const [newTokens, setNewTokens] = useState<any[]>([]);
  const [latestToken, setLatestToken] = useState<any | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    console.log(`[WebSocket] Connecting to PumpPortal... (Attempt ${reconnectAttemptsRef.current + 1})`);
    const ws = new WebSocket('wss://pumpportal.fun/api/data');

    ws.onopen = () => {
      console.log('[WebSocket] ✅ Connected to PumpPortal');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      if (subscribeToNewTokens) {
        // Subscribe to all new token creations
        const subscribeMessage = {
          method: 'subscribeNewToken'
        };
        console.log('[WebSocket] 📡 Subscribing to new tokens');
        ws.send(JSON.stringify(subscribeMessage));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        console.log('[WebSocket] 📨 RAW MESSAGE:', JSON.stringify(data, null, 2));
        
        if (subscribeToNewTokens && data.txType === 'create') {
          // New token creation event
          console.log('[WebSocket] 🎯 New token created!', data.name, data.symbol);
          
          const token = {
            mint: data.mint,
            name: data.name,
            symbol: data.symbol,
            description: data.description,
            image_uri: data.image_uri || data.image || data.uri,
            timestamp: data.timestamp || Date.now() / 1000,
            creator: data.traderPublicKey
          };
          
          setLatestToken(token);
          setNewTokens(prev => [token, ...prev].slice(0, 20));
        }
      } catch (error) {
        console.error('[WebSocket] ❌ Parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] ❌ WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log(`[WebSocket] 🔌 Disconnected from PumpPortal (Code: ${event.code}, Reason: ${event.reason || 'none'})`);
      setIsConnected(false);
      wsRef.current = null;
      
      // Implement exponential backoff reconnection
      const maxReconnectAttempts = 10;
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 seconds
        console.log(`[WebSocket] 🔄 Reconnecting in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[WebSocket] ⛔ Max reconnection attempts reached. Please refresh the page.');
      }
    };

    wsRef.current = ws;
  }, [subscribeToNewTokens]);

  const disconnect = useCallback(() => {
    console.log('[WebSocket] 🛑 Manual disconnect');
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      // Clean up on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [subscribeToNewTokens]);

  return {
    trades,
    isConnected,
    latestTrade,
    newTokens,
    latestToken,
    reconnect: connect
  };
};

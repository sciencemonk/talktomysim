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

export const usePumpFunStream = (tokenAddress: string) => {
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestTrade, setLatestTrade] = useState<TradeEvent | null>(null);
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
      
      // Subscribe to trades for this specific token
      const subscribeMessage = {
        method: 'subscribeTokenTrade',
        keys: [tokenAddress]
      };
      
      console.log('[WebSocket] 📡 Sending subscription:', subscribeMessage);
      ws.send(JSON.stringify(subscribeMessage));
      console.log(`[WebSocket] 📡 Subscribed to token: ${tokenAddress}`);
      
      // Also subscribe to new token events to verify connection is working
      setTimeout(() => {
        const newTokenSub = {
          method: 'subscribeNewToken'
        };
        console.log('[WebSocket] 📡 Also subscribing to new tokens to test connection');
        ws.send(JSON.stringify(newTokenSub));
      }, 1000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Debug: Log ALL messages to see actual trade structure
        console.log('[WebSocket] 📨 Incoming message:', JSON.stringify(data, null, 2));
        
        // Handle different message types from PumpPortal
        // Check if this is a trade message (they use 'txType' field)
        if (data.txType && (data.txType === 'buy' || data.txType === 'sell' || data.txType === 'create')) {
          console.log('[WebSocket] 🎯 Trade detected:', data.txType.toUpperCase());
          
          // 'create' txType means new token with initial buy
          const isBuy = data.txType === 'buy' || data.txType === 'create';
          const tokenAmount = data.txType === 'create' ? data.initialBuy : data.tokenAmount;
          
          const trade: TradeEvent = {
            signature: data.signature || `trade_${Date.now()}_${Math.random()}`,
            mint: data.mint || tokenAddress,
            sol_amount: Number((data.solAmount || 0).toFixed(3)),
            token_amount: Math.round(tokenAmount || 0),
            is_buy: isBuy,
            user: data.traderPublicKey || data.user || 'unknown',
            timestamp: data.timestamp || Date.now() / 1000,
            market_cap_sol: data.marketCapSol || 0
          };
          
          console.log('[WebSocket] ✅ Trade processed:', {
            type: trade.is_buy ? 'BUY' : 'SELL',
            tokens: `${(trade.token_amount / 1e6).toFixed(2)}M`,
            sol: `${trade.sol_amount} SOL`,
            time: new Date(trade.timestamp * 1000).toLocaleTimeString()
          });
          
          setLatestTrade(trade);
          setTrades(prev => [trade, ...prev].slice(0, 50));
        } 
        // Check if message has signature (might be at different level)
        else if (data.signature || data.sig) {
          console.log('[WebSocket] 🔍 Message with signature detected, fields:', Object.keys(data));
          const isBuy = data.isBuy === true || data.is_buy === true || data.txType === 'buy' || data.txType === 'create';
          const tokenAmount = data.tokenAmount || data.token_amount || data.initialBuy || 0;
          
          const trade: TradeEvent = {
            signature: data.signature || data.sig,
            mint: data.mint || tokenAddress,
            sol_amount: Number((data.solAmount || data.sol_amount || 0).toFixed(3)),
            token_amount: Math.round(tokenAmount),
            is_buy: isBuy,
            user: data.user || data.traderPublicKey || 'unknown',
            timestamp: data.timestamp || Date.now() / 1000,
            market_cap_sol: data.marketCapSol || data.market_cap_sol || 0
          };
          
          console.log('[WebSocket] ✅ Trade processed from sig:', {
            type: trade.is_buy ? 'BUY' : 'SELL',
            tokens: `${(trade.token_amount / 1e6).toFixed(2)}M`,
            sol: `${trade.sol_amount} SOL`
          });
          
          setLatestTrade(trade);
          setTrades(prev => [trade, ...prev].slice(0, 50));
        }
        else {
          console.log('[WebSocket] ℹ️ Unknown message format. Fields:', Object.keys(data));
        }
      } catch (error) {
        console.error('[WebSocket] ❌ Parse error:', error);
        console.log('[WebSocket] Raw data:', event.data.substring(0, 500));
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
  }, [tokenAddress]);

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
  }, [tokenAddress]); // Only reconnect when token address changes

  return {
    trades,
    isConnected,
    latestTrade,
    reconnect: connect
  };
};

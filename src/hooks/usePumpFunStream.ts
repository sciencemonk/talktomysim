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
      
      console.log('[WebSocket] 📡 Sending subscription for token:', tokenAddress);
      ws.send(JSON.stringify(subscribeMessage));
      
      // TEMPORARILY also subscribe to all new tokens to test if WebSocket is working
      const testSubscribe = {
        method: 'subscribeNewToken'
      };
      console.log('[WebSocket] 📡 Also subscribing to new tokens to test connection');
      ws.send(JSON.stringify(testSubscribe));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // DETAILED LOGGING - Log the entire message to debug
        console.log('[WebSocket] 📨 RAW MESSAGE:', JSON.stringify(data, null, 2));
        
        // Handle different message types from PumpPortal
        // Check if this is a trade message (they use 'txType' field)
        if (data.txType && (data.txType === 'buy' || data.txType === 'sell' || data.txType === 'create')) {
          console.log('[WebSocket] 🎯 Trade detected! Type:', data.txType.toUpperCase());
          console.log('[WebSocket] 📍 Trade mint:', data.mint);
          console.log('[WebSocket] 📍 Expected token:', tokenAddress);
          
          // CRITICAL: Filter out trades that aren't for our token
          if (data.mint && data.mint !== tokenAddress) {
            console.log('[WebSocket] ⚠️ Ignoring trade for different token:', data.mint);
            return;
          }
          
          console.log('[WebSocket] ✅ $SIMAI Trade accepted! Processing...');
          
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
          
          console.log('[WebSocket] 💾 Adding trade to state:', {
            signature: trade.signature.slice(0, 8),
            type: trade.is_buy ? 'BUY' : 'SELL',
            tokens: `${(trade.token_amount / 1e6).toFixed(2)}M`,
            sol: `${trade.sol_amount} SOL`,
            mint: trade.mint
          });
          
          setLatestTrade(trade);
          setTrades(prev => {
            const updated = [trade, ...prev].slice(0, 50);
            console.log('[WebSocket] 📊 Total trades in state:', updated.length);
            return updated;
          });
        } else if (data.message) {
          console.log('[WebSocket] ℹ️ Server message:', data.message);
        } else {
          console.log('[WebSocket] ℹ️ Unknown message type. Full data:', data);
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
  }, [tokenAddress]); // Only reconnect when token changes

  return {
    trades,
    isConnected,
    latestTrade,
    reconnect: connect
  };
};

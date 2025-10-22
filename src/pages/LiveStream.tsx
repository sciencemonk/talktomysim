import { useState, useEffect, useRef } from 'react';
import { usePumpFunStream } from '@/hooks/usePumpFunStream';
import { useLivestreamChat } from '@/hooks/useLivestreamChat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import TopNavigation from '@/components/TopNavigation';
import { Send, TrendingUp, TrendingDown, Activity, Users, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveStream = () => {
  const { trades, isConnected, latestTrade } = usePumpFunStream(false);
  const { messages, isProcessing, sendMessage, addCommentary } = useLivestreamChat('sim-commentator', 'Sim AI');
  const [inputMessage, setInputMessage] = useState('');
  const [viewerCount] = useState(Math.floor(Math.random() * 50) + 20);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTradeRef = useRef<typeof latestTrade>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // React to trades with commentary
  useEffect(() => {
    if (latestTrade && latestTrade !== lastTradeRef.current) {
      lastTradeRef.current = latestTrade;
      
      const commentaries = latestTrade.is_buy ? [
        `🚀 BIG BUY! ${latestTrade.sol_amount.toFixed(2)} SOL dropped! LFG!!!`,
        `💰 WHOA! Someone just ape'd in with ${latestTrade.sol_amount.toFixed(2)} SOL!`,
        `📈 BULLISH! ${latestTrade.sol_amount.toFixed(2)} SOL buy just hit!`,
        `🔥 They're loading up! ${latestTrade.sol_amount.toFixed(2)} SOL in!`,
      ] : [
        `📉 ${latestTrade.sol_amount.toFixed(2)} SOL sell... paper hands!`,
        `👋 Someone taking profits - ${latestTrade.sol_amount.toFixed(2)} SOL out`,
        `⚠️ Sell alert: ${latestTrade.sol_amount.toFixed(2)} SOL`,
        `🧻 Paper hands strike again - ${latestTrade.sol_amount.toFixed(2)} SOL`,
      ];

      if (latestTrade.sol_amount > 0.5) {
        addCommentary(commentaries[Math.floor(Math.random() * commentaries.length)]);
      }
    }
  }, [latestTrade, addCommentary]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary animate-pulse" />
                $SIMAI Live Stream
              </h1>
              <p className="text-muted-foreground mt-1">Watch AI-powered market commentary in real-time</p>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-lg px-4 py-2">
              <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Viewers</span>
              </div>
              <p className="text-2xl font-bold">{viewerCount}</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Trades</span>
              </div>
              <p className="text-2xl font-bold">{trades.length}</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Market Cap</span>
              </div>
              <p className="text-2xl font-bold">
                {latestTrade ? `${latestTrade.market_cap_sol.toFixed(1)}◎` : '--'}
              </p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Last Trade</span>
              </div>
              <p className="text-2xl font-bold">
                {latestTrade ? `${latestTrade.sol_amount.toFixed(2)}◎` : '--'}
              </p>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Feed */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Trade Feed
            </h2>
            <ScrollArea className="h-[600px] pr-4">
              <AnimatePresence mode="popLayout">
                {trades.map((trade, index) => (
                  <motion.div
                    key={trade.signature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-3"
                  >
                    <Card className={`p-4 border-l-4 ${trade.is_buy ? 'border-l-green-500' : 'border-l-red-500'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {trade.is_buy ? (
                            <TrendingUp className="h-6 w-6 text-green-500" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-500" />
                          )}
                          <div>
                            <p className="font-semibold text-lg">
                              {trade.is_buy ? 'BUY' : 'SELL'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(trade.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{trade.sol_amount.toFixed(3)} SOL</p>
                          <p className="text-sm text-muted-foreground">
                            MC: {trade.market_cap_sol.toFixed(1)}◎
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {trades.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Waiting for trades...</p>
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/sim-logo.png" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              Chat with Sim AI
            </h2>
            
            <ScrollArea className="h-[480px] mb-4 pr-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-2">👋 Hey! I'm your AI commentator</p>
                  <p className="text-sm">Ask me anything about the stream!</p>
                </div>
              )}
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
                  >
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Chat with Sim AI..."
                disabled={isProcessing}
              />
              <Button 
                onClick={handleSend} 
                disabled={isProcessing || !inputMessage.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Link to Pump.fun */}
        <Card className="mt-6 p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Want to trade $SIMAI?</h3>
              <p className="text-sm text-muted-foreground">Head to Pump.fun to buy or sell</p>
            </div>
            <Button asChild>
              <a 
                href="https://pump.fun/coin/FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trade on Pump.fun
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveStream;


import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Shield,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { useAgentDetails } from '@/hooks/useAgentDetails';
import { ConversationsDashboard } from '@/components/ConversationsDashboard';

const AgentAnalytics = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { agent, isLoading } = useAgentDetails(agentId!);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data for analytics
  const conversationData = [
    { name: 'Mon', conversations: 12, messages: 45 },
    { name: 'Tue', conversations: 18, messages: 67 },
    { name: 'Wed', conversations: 15, messages: 52 },
    { name: 'Thu', conversations: 22, messages: 89 },
    { name: 'Fri', conversations: 28, messages: 134 },
    { name: 'Sat', conversations: 19, messages: 78 },
    { name: 'Sun', conversations: 14, messages: 43 },
  ];

  const intentData = [
    { name: 'General Questions', value: 45, color: '#8884d8' },
    { name: 'Sales Inquiries', value: 25, color: '#82ca9d' },
    { name: 'Support Requests', value: 20, color: '#ffc658' },
    { name: 'VIP Inquiries', value: 10, color: '#ff7c7c' },
  ];

  const timeDistribution = [
    { hour: '00', conversations: 2 },
    { hour: '06', conversations: 5 },
    { hour: '09', conversations: 15 },
    { hour: '12', conversations: 28 },
    { hour: '15', conversations: 35 },
    { hour: '18', conversations: 22 },
    { hour: '21', conversations: 8 },
  ];

  if (isLoading || !agent) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Conversations',
      value: '1,247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: MessageSquare,
    },
    {
      title: 'Unique Users',
      value: '892',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Avg. Response Time',
      value: '1.2s',
      change: '-5%',
      changeType: 'positive' as const,
      icon: Clock,
    },
    {
      title: 'Escalated Conversations',
      value: '34',
      change: '+23%',
      changeType: 'neutral' as const,
      icon: Shield,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{agent.name} Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your agent's performance and user interactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            View Agent
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <Badge
                      variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversations" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversation Intents</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={intentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {intentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <ConversationsDashboard advisorId={agent.id} />
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Scoring Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { score: '0-2', count: 45 },
                    { score: '3-4', count: 78 },
                    { score: '5-6', count: 123 },
                    { score: '7-8', count: 67 },
                    { score: '9-10', count: 34 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escalation Triggers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">VIP Keywords</span>
                  <Badge variant="outline">12 triggers</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Value Keywords</span>
                  <Badge variant="outline">18 triggers</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Urgency Keywords</span>
                  <Badge variant="outline">8 triggers</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Message Count</span>
                  <Badge variant="outline">15 triggers</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversations" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentAnalytics;

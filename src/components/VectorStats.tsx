
import React, { useState, useEffect } from 'react';
import { Database, FileText, Layers, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { documentService } from '@/services/documentService';

interface VectorStatsProps {
  advisorId: string;
}

export const VectorStats: React.FC<VectorStatsProps> = ({ advisorId }) => {
  const [stats, setStats] = useState({ totalChunks: 0, totalDocuments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [advisorId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const embedStats = await documentService.getEmbeddingStats(advisorId);
      setStats(embedStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: FileText,
      label: 'Documents',
      value: stats.totalDocuments,
      description: 'Total uploaded'
    },
    {
      icon: Layers,
      label: 'Vector Chunks',
      value: stats.totalChunks,
      description: 'Text segments'
    },
    {
      icon: Database,
      label: 'Embedding Size',
      value: stats.totalChunks * 1536, // OpenAI ada-002 dimension
      description: 'Vector dimensions'
    },
    {
      icon: BarChart3,
      label: 'Knowledge Score',
      value: Math.min(100, Math.round((stats.totalChunks / 100) * 100)),
      description: 'Completeness %'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

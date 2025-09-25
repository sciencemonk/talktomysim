import React, { useEffect, useState } from 'react';
import { KnowledgeEnhancementManager } from '@/components/KnowledgeEnhancementManager';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Advisor {
  id: string;
  name: string;
}

export default function KnowledgeEnhancement() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const { data, error } = await supabase
          .from('advisors')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching advisors:', error);
        } else {
          setAdvisors(data || []);
        }
      } catch (error) {
        console.error('Error fetching advisors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Enhancement</h1>
        <p className="text-muted-foreground mt-2">
          Enhance advisor knowledge bases with comprehensive web research and vector embeddings.
        </p>
      </div>
      
      <KnowledgeEnhancementManager advisors={advisors} />
    </div>
  );
}
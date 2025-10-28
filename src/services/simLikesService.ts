import { supabase } from "@/integrations/supabase/client";

// Generate a unique session ID for anonymous users
const getOrCreateSessionId = (): string => {
  const SESSION_KEY = 'sim_session_id';
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

export const getLikeCount = async (simId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('sim_likes')
    .select('*', { count: 'exact', head: true })
    .eq('sim_id', simId);
  
  if (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
  
  return count || 0;
};

export const isSimLiked = async (simId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('sim_likes')
    .select('id')
    .eq('sim_id', simId);
  
  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    const sessionId = getOrCreateSessionId();
    query = query.eq('session_id', sessionId);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Error checking if sim is liked:', error);
    return false;
  }
  
  return !!data;
};

export const toggleSimLike = async (simId: string): Promise<{ liked: boolean; count: number }> => {
  const { data: { user } } = await supabase.auth.getUser();
  const isLiked = await isSimLiked(simId);
  
  if (isLiked) {
    // Unlike
    let deleteQuery = supabase
      .from('sim_likes')
      .delete()
      .eq('sim_id', simId);
    
    if (user) {
      deleteQuery = deleteQuery.eq('user_id', user.id);
    } else {
      const sessionId = getOrCreateSessionId();
      deleteQuery = deleteQuery.eq('session_id', sessionId);
    }
    
    const { error } = await deleteQuery;
    
    if (error) {
      console.error('Error unliking sim:', error);
      throw error;
    }
    
    const count = await getLikeCount(simId);
    return { liked: false, count };
  } else {
    // Like
    const likeData: any = {
      sim_id: simId,
    };
    
    if (user) {
      likeData.user_id = user.id;
    } else {
      likeData.session_id = getOrCreateSessionId();
    }
    
    const { error } = await supabase
      .from('sim_likes')
      .insert(likeData);
    
    if (error) {
      console.error('Error liking sim:', error);
      throw error;
    }
    
    const count = await getLikeCount(simId);
    return { liked: true, count };
  }
};

// Get multiple sim like counts in one query (more efficient for listing pages)
export const getMultipleSimLikeCounts = async (simIds: string[]): Promise<Map<string, number>> => {
  const { data, error } = await supabase
    .from('sim_likes')
    .select('sim_id')
    .in('sim_id', simIds);
  
  if (error) {
    console.error('Error getting multiple like counts:', error);
    return new Map();
  }
  
  const countMap = new Map<string, number>();
  data?.forEach(like => {
    const count = countMap.get(like.sim_id) || 0;
    countMap.set(like.sim_id, count + 1);
  });
  
  return countMap;
};

// Check multiple sims for liked status (for listing pages)
export const getMultipleSimLikedStatus = async (simIds: string[]): Promise<Set<string>> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('sim_likes')
    .select('sim_id')
    .in('sim_id', simIds);
  
  if (user) {
    query = query.eq('user_id', user.id);
  } else {
    const sessionId = getOrCreateSessionId();
    query = query.eq('session_id', sessionId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error checking multiple sim liked status:', error);
    return new Set();
  }
  
  return new Set(data?.map(like => like.sim_id) || []);
};

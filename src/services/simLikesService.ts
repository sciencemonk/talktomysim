import { supabase } from "@/integrations/supabase/client";

// Storage key for IP address
const IP_STORAGE_KEY = 'sim_user_ip';

// Get the client's IP address with localStorage persistence
const getClientIp = async (): Promise<string> => {
  // First check localStorage
  const storedIp = localStorage.getItem(IP_STORAGE_KEY);
  if (storedIp && storedIp !== 'unknown') {
    console.log('Using stored IP:', storedIp);
    return storedIp;
  }

  try {
    console.log('Fetching IP from edge function...');
    const { data, error } = await supabase.functions.invoke('get-client-ip');
    
    if (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
    
    const ip = data?.ip || 'unknown';
    
    // Only store valid IPs
    if (ip && ip !== 'unknown') {
      localStorage.setItem(IP_STORAGE_KEY, ip);
      console.log('IP fetched and stored:', ip);
    }
    
    return ip;
  } catch (error) {
    console.error('Error fetching client IP:', error);
    return 'unknown';
  }
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
    const ipAddress = await getClientIp();
    query = query.eq('ip_address', ipAddress);
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
      const ipAddress = await getClientIp();
      if (ipAddress === 'unknown') {
        throw new Error('Unable to verify IP address');
      }
      deleteQuery = deleteQuery.eq('ip_address', ipAddress);
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
      const ipAddress = await getClientIp();
      if (ipAddress === 'unknown') {
        throw new Error('Unable to verify IP address');
      }
      likeData.ip_address = ipAddress;
      console.log('Creating like with IP:', ipAddress);
    }
    
    const { error } = await supabase
      .from('sim_likes')
      .insert(likeData);
    
    if (error) {
      console.error('Error liking sim:', error);
      // Check if it's a duplicate key error
      if (error.code === '23505') {
        console.log('Duplicate like detected - sim already liked');
        // Return current state since it's already liked
        const count = await getLikeCount(simId);
        return { liked: true, count };
      }
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
    const ipAddress = await getClientIp();
    query = query.eq('ip_address', ipAddress);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error checking multiple sim liked status:', error);
    return new Set();
  }
  
  return new Set(data?.map(like => like.sim_id) || []);
};

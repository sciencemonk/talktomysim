import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const DebugAdvisors = () => {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        console.log("Fetching advisors directly...");
        const { data, error } = await supabase.from('advisors').select('*');
        
        if (error) {
          console.error("Error fetching advisors:", error);
          setError(error.message);
          return;
        }
        
        console.log(`Found ${data?.length || 0} advisors`);
        setAdvisors(data || []);
      } catch (e: any) {
        console.error("Unexpected error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Advisors</h1>
      
      {loading ? (
        <p>Loading advisors...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div>
          <p className="mb-4">Found {advisors.length} advisors</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Is Public</th>
                  <th className="border p-2">Is Active</th>
                  <th className="border p-2">Avatar URL</th>
                  <th className="border p-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {advisors.map(advisor => (
                  <tr key={advisor.id}>
                    <td className="border p-2">{advisor.id}</td>
                    <td className="border p-2">{advisor.name}</td>
                    <td className="border p-2">{advisor.is_public ? 'Yes' : 'No'}</td>
                    <td className="border p-2">{advisor.is_active ? 'Yes' : 'No'}</td>
                    <td className="border p-2">{advisor.avatar_url || 'None'}</td>
                    <td className="border p-2">{new Date(advisor.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Raw Advisor Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
              {JSON.stringify(advisors, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugAdvisors;

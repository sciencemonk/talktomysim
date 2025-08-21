import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const advisors = [
    { id: 1, name: 'Advisor 1', description: 'Description for Advisor 1', featured: true, new: false },
    { id: 2, name: 'Advisor 2', description: 'Description for Advisor 2', featured: false, new: true },
    { id: 3, name: 'Advisor 3', description: 'Description for Advisor 3', featured: true, new: true },
    { id: 4, name: 'Advisor 4', description: 'Description for Advisor 4', featured: false, new: false },
  ];

  const filteredAdvisors = advisors.filter(advisor => {
    const searchMatch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase());
    let filterMatch = true;

    if (activeFilter === 'featured' && !advisor.featured) {
      filterMatch = false;
    }

    if (activeFilter === 'new' && !advisor.new) {
      filterMatch = false;
    }

    return searchMatch && filterMatch;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full"></div>
              <span className="text-xl font-semibold">Sim</span>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="p-6 text-center border-b">
            <h2 className="text-lg font-medium mb-2">Welcome to Sim</h2>
            <p className="text-gray-600 text-sm mb-4">Talk with a Sim</p>
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              onClick={() => navigate('/login')}
            >
              Get Started for Free
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul>
              <li className="mb-2">
                <a href="#" className="block text-gray-700 hover:text-blue-500">Dashboard</a>
              </li>
              <li className="mb-2">
                <a href="#" className="block text-gray-700 hover:text-blue-500">Advisors</a>
              </li>
              <li className="mb-2">
                <a href="#" className="block text-gray-700 hover:text-blue-500">Settings</a>
              </li>
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-6 border-t">
            <Button variant="outline" className="w-full" onClick={async () => {
              await supabase.auth.signOut();
              navigate('/login');
            }}>Logout</Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header with Search and Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search advisors..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex space-x-2">
              <Button
                variant={activeFilter === 'all' ? 'selected' : 'outline'}
                onClick={() => setActiveFilter('all')}
                className="px-4 py-2"
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'featured' ? 'selected' : 'outline'}
                onClick={() => setActiveFilter('featured')}
                className="px-4 py-2"
              >
                Featured
              </Button>
              <Button
                variant={activeFilter === 'new' ? 'selected' : 'outline'}
                onClick={() => setActiveFilter('new')}
                className="px-4 py-2"
              >
                New
              </Button>
            </div>
          </div>

          {/* Advisor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdvisors.map(advisor => (
              <Card key={advisor.id}>
                <CardHeader>
                  <CardTitle>{advisor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{advisor.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

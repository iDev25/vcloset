import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import StoryPage from './pages/StoryPage';
import CreateStoryPage from './pages/CreateStoryPage';
import BrowseStoriesPage from './pages/BrowseStoriesPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState(null);

  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase session error:", error);
          setSupabaseError("Failed to connect to Supabase. Please check your configuration.");
          setIsLoading(false);
          return;
        }
        
        setUser(session?.user || null);
        setIsLoading(false);
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setUser(session?.user || null);
          }
        );
        
        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Unexpected error:", err);
        setSupabaseError("An unexpected error occurred. Please check your Supabase configuration.");
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (supabaseError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="mb-4">{supabaseError}</p>
          <div className="bg-white p-4 rounded border border-gray-300 text-sm text-left mb-4">
            <p className="font-mono mb-2">1. Check your .env file has these variables:</p>
            <pre className="bg-gray-100 p-2 rounded">
              VITE_SUPABASE_URL=your-project-url{"\n"}
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/browse" element={<BrowseStoriesPage />} />
          <Route path="/story/:id" element={<StoryPage />} />
          <Route 
            path="/create" 
            element={user ? <CreateStoryPage /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <ProfilePage /> : <Navigate to="/auth" />} 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;

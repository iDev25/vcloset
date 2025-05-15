import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { FiUser, FiEdit, FiBook, FiGitBranch, FiPlus } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [userContributions, setUserContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stories');
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        // Fetch stories created by user
        const { data: storiesData, error: storiesError } = await supabase
          .from('stories')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
        
        if (storiesError) throw storiesError;
        
        // Fetch contributions by user
        const { data: contributionsData, error: contributionsError } = await supabase
          .from('contributions')
          .select(`
            *,
            story_branches(
              id,
              title,
              stories(
                id,
                title
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (contributionsError) throw contributionsError;
        
        setProfile(profileData || { id: user.id, username: user.email?.split('@')[0] });
        setUserStories(storiesData || []);
        setUserContributions(contributionsData || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div>
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.username} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <FiUser size={48} className="text-gray-400" />
            )}
          </div>
          
          <div className="flex-grow text-center sm:text-left">
            <h1 className="text-2xl font-bold mb-2">
              {profile?.username || user.email?.split('@')[0]}
            </h1>
            <p className="text-gray-600 mb-4">
              {profile?.bio || 'No bio yet'}
            </p>
            <button className="btn btn-outline flex items-center mx-auto sm:mx-0">
              <FiEdit className="mr-2" />
              Edit Profile
            </button>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">{userStories.length}</div>
              <div className="text-gray-600">Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{userContributions.length}</div>
              <div className="text-gray-600">Contributions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'stories'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiBook className="inline mr-2" />
          My Stories
        </button>
        <button
          onClick={() => setActiveTab('contributions')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'contributions'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiGitBranch className="inline mr-2" />
          My Contributions
        </button>
      </div>
      
      {/* Tab content */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading your content...</p>
        </div>
      ) : (
        <div>
          {/* Stories tab */}
          {activeTab === 'stories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Stories You've Created</h2>
                <Link to="/create" className="btn btn-primary flex items-center">
                  <FiPlus className="mr-2" />
                  New Story
                </Link>
              </div>
              
              {userStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userStories.map(story => (
                    <div key={story.id} className="card">
                      <h3 className="text-lg font-bold mb-2">
                        <Link to={`/story/${story.id}`} className="hover:text-primary-600">
                          {story.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {story.description.length > 100
                          ? `${story.description.substring(0, 100)}...`
                          : story.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{formatDate(story.created_at)}</span>
                        <Link to={`/story/${story.id}`} className="text-primary-600 hover:underline">
                          View Story
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-8">
                  <FiBook className="text-gray-400 text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No Stories Yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't created any stories yet. Start your first story now!
                  </p>
                  <Link to="/create" className="btn btn-primary">
                    Create Story
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Contributions tab */}
          {activeTab === 'contributions' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Your Contributions</h2>
              
              {userContributions.length > 0 ? (
                <div className="space-y-4">
                  {userContributions.map(contribution => (
                    <div key={contribution.id} className="card">
                      <div className="mb-2">
                        <Link 
                          to={`/story/${contribution.story_branches?.stories?.id}`}
                          className="text-lg font-bold hover:text-primary-600"
                        >
                          {contribution.story_branches?.stories?.title || 'Unknown Story'}
                        </Link>
                        <span className="text-gray-500 text-sm ml-2">
                          ({contribution.story_branches?.title || 'Unknown Branch'})
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                        <p className="text-gray-800">{contribution.content}</p>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{formatDate(contribution.created_at)}</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <span className="text-green-600 mr-1">+{contribution.upvotes || 0}</span>
                            <span className="text-red-600">-{contribution.downvotes || 0}</span>
                          </div>
                          <Link 
                            to={`/story/${contribution.story_branches?.stories?.id}`}
                            className="text-primary-600 hover:underline"
                          >
                            View Story
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-8">
                  <FiGitBranch className="text-gray-400 text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No Contributions Yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't contributed to any stories yet. Browse stories and start contributing!
                  </p>
                  <Link to="/browse" className="btn btn-primary">
                    Browse Stories
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

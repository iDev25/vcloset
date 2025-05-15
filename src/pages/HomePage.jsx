import { Link } from 'react-router-dom';
import { FiBookOpen, FiEdit, FiGitBranch, FiUsers } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useStoryStore } from '../stores/storyStore';
import StoryCard from '../components/story/StoryCard';

const HomePage = () => {
  const { fetchStories, stories, isLoading } = useStoryStore();
  const [featuredStories, setFeaturedStories] = useState([]);
  
  useEffect(() => {
    const loadFeaturedStories = async () => {
      await fetchStories();
    };
    
    loadFeaturedStories();
  }, [fetchStories]);
  
  useEffect(() => {
    // Get up to 3 stories for the featured section
    setFeaturedStories(stories.slice(0, 3));
  }, [stories]);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Collaborative Storytelling Reimagined
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Create and contribute to branching narratives, one sentence at a time.
            Vote on plot directions and explore endless story possibilities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/browse" className="btn bg-white text-primary-700 hover:bg-gray-100">
              Browse Stories
            </Link>
            <Link to="/create" className="btn bg-primary-500 text-white hover:bg-primary-400 border border-white">
              Start Writing
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FiEdit size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Contribute</h3>
              <p className="text-gray-600">
                Add one sentence at a time to continue the story in your own way.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FiGitBranch size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Branch</h3>
              <p className="text-gray-600">
                Create alternative story paths when you imagine a different direction.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FiUsers size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vote</h3>
              <p className="text-gray-600">
                Vote on contributions to help shape the most popular story paths.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FiBookOpen size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Explore</h3>
              <p className="text-gray-600">
                Discover different endings and narrative possibilities in each story.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Stories Section */}
      <section className="py-16 bg-gray-50 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Stories</h2>
            <Link to="/browse" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredStories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No stories yet. Be the first to create one!</p>
              <Link to="/create" className="btn btn-primary mt-4">
                Create a Story
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Story?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of storytellers and create your own branching narrative today.
          </p>
          <Link to="/create" className="btn btn-primary">
            Start Writing
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

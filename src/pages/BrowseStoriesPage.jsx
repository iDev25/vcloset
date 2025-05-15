import { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { useStoryStore } from '../stores/storyStore';
import StoryCard from '../components/story/StoryCard';

const BrowseStoriesPage = () => {
  const { fetchStories, stories, isLoading } = useStoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredStories, setFilteredStories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);
  
  useEffect(() => {
    // Extract all unique tags from stories
    if (stories.length > 0) {
      const tags = new Set();
      stories.forEach(story => {
        if (story.tags && Array.isArray(story.tags)) {
          story.tags.forEach(tag => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));
    }
    
    // Apply filters
    let result = [...stories];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(story => 
        story.title.toLowerCase().includes(term) || 
        story.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by tag
    if (selectedTag) {
      result = result.filter(story => 
        story.tags && story.tags.includes(selectedTag)
      );
    }
    
    setFilteredStories(result);
  }, [stories, searchTerm, selectedTag]);
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Stories</h1>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-outline flex items-center"
        >
          <FiFilter className="mr-1" />
          Filters
        </button>
      </div>
      
      {/* Search and filters */}
      <div className={`bg-white rounded-lg shadow-md p-4 mb-6 ${showFilters ? 'block' : 'hidden'}`}>
        <div className="mb-4">
          <label htmlFor="search" className="block text-gray-700 font-medium mb-2">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              placeholder="Search by title or description"
            />
          </div>
        </div>
        
        {allTags.length > 0 && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Filter by Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTag === tag
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {(searchTerm || selectedTag) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="btn btn-outline flex items-center"
            >
              <FiX className="mr-1" />
              Clear Filters
            </button>
          </div>
        )}
      </div>
      
      {/* Stories grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredStories.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-4">No stories found</p>
          {(searchTerm || selectedTag) ? (
            <button
              onClick={clearFilters}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          ) : (
            <p className="text-gray-400">Be the first to create a story!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseStoriesPage;

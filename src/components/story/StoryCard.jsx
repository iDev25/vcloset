import { Link } from 'react-router-dom';
import { FiUser, FiCalendar, FiGitBranch, FiMessageSquare } from 'react-icons/fi';

const StoryCard = ({ story }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Truncate description if it's too long
  const truncateDescription = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/story/${story.id}`} className="block">
        <div className="h-40 bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center">
          <h3 className="text-xl font-bold text-white px-4 text-center">
            {story.title}
          </h3>
        </div>
      </Link>
      
      <div className="p-4">
        <p className="text-gray-600 mb-4">
          {truncateDescription(story.description)}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {story.tags && story.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <FiUser className="mr-1" />
            <span>{story.creator?.username || 'Anonymous'}</span>
          </div>
          
          <div className="flex items-center">
            <FiCalendar className="mr-1" />
            <span>{formatDate(story.created_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm">
          <div className="flex items-center text-gray-500">
            <FiGitBranch className="mr-1" />
            <span>{story.branch_count || 1} branches</span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <FiMessageSquare className="mr-1" />
            <span>{story.contribution_count || 0} contributions</span>
          </div>
          
          <Link 
            to={`/story/${story.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Read →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;

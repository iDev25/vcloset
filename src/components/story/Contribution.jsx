import { useState } from 'react';
import { FiThumbsUp, FiThumbsDown, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore';

const Contribution = ({ 
  contribution, 
  onVote, 
  isBeginning = false,
  showAuthor = true
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useAuthStore();
  
  const handleVote = async (voteType) => {
    if (!user || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(contribution.id, user.id, voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };
  
  return (
    <div className={`p-4 rounded-lg mb-4 ${isBeginning ? 'bg-primary-50 border border-primary-100' : 'bg-white border border-gray-200'}`}>
      <div className="prose max-w-none mb-3">
        <p>{contribution.content}</p>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-sm">
        {showAuthor && (
          <div className="flex items-center text-gray-600">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
              {contribution.profiles?.avatar_url ? (
                <img 
                  src={contribution.profiles.avatar_url} 
                  alt={contribution.profiles.username || 'User'} 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <FiUser size={12} />
              )}
            </div>
            <span>{contribution.profiles?.username || 'Anonymous'}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleVote('up')}
            disabled={!user || isVoting}
            className={`flex items-center ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary-600'}`}
            title={user ? 'Upvote' : 'Sign in to vote'}
          >
            <FiThumbsUp className="mr-1" />
            <span>{contribution.upvotes || 0}</span>
          </button>
          
          <button 
            onClick={() => handleVote('down')}
            disabled={!user || isVoting}
            className={`flex items-center ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600'}`}
            title={user ? 'Downvote' : 'Sign in to vote'}
          >
            <FiThumbsDown className="mr-1" />
            <span>{contribution.downvotes || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contribution;

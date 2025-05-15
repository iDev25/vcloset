import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiUser, FiCalendar, FiGitBranch, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { useStoryStore } from '../stores/storyStore';
import { useAuthStore } from '../stores/authStore';
import { joinStoryRoom, leaveStoryRoom, sendVote } from '../lib/socket';
import Contribution from '../components/story/Contribution';
import ContributionForm from '../components/story/ContributionForm';

const StoryPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { 
    fetchStory, 
    currentStory, 
    currentBranch, 
    contributions, 
    changeBranch,
    voteOnContribution,
    isLoading, 
    error, 
    clearStory 
  } = useStoryStore();
  
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  
  useEffect(() => {
    // Fetch the story when the component mounts
    fetchStory(id);
    
    // Join the WebSocket room for this story
    if (user) {
      joinStoryRoom(id);
    }
    
    // Clean up when the component unmounts
    return () => {
      clearStory();
      leaveStoryRoom(id);
    };
  }, [id, fetchStory, clearStory, user]);
  
  const handleVote = async (contributionId, userId, voteType) => {
    // Update in the database
    await voteOnContribution(contributionId, voteType);
    
    // Send the vote via WebSocket
    sendVote(id, contributionId, voteType);
  };
  
  const handleBranchChange = (branchId) => {
    changeBranch(branchId);
    setShowBranchSelector(false);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (isLoading && !currentStory) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <Link to="/browse" className="text-red-700 font-bold hover:underline">
          Back to Browse
        </Link>
      </div>
    );
  }
  
  if (!currentStory) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Story not found</p>
        <Link to="/browse" className="btn btn-primary mt-4">
          Browse Stories
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Link to="/browse" className="text-primary-600 hover:text-primary-700 flex items-center">
          <FiArrowLeft className="mr-1" /> Back to Browse
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{currentStory.title}</h1>
          <p className="text-primary-100 mb-4">{currentStory.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {currentStory.tags && currentStory.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-block bg-primary-500 bg-opacity-30 text-white text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-primary-100">
            <div className="flex items-center">
              <FiUser className="mr-1" />
              <span>{currentStory.creator?.username || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center">
              <FiCalendar className="mr-1" />
              <span>{formatDate(currentStory.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Branch selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiGitBranch className="mr-2 text-primary-600" />
            <h2 className="text-xl font-semibold">
              {currentBranch?.title || 'Main Branch'}
            </h2>
          </div>
          
          <button
            onClick={() => setShowBranchSelector(!showBranchSelector)}
            className="btn btn-outline flex items-center"
          >
            <FiGitBranch className="mr-1" />
            Switch Branch
          </button>
        </div>
        
        {showBranchSelector && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium mb-3">Available Branches</h3>
            <div className="space-y-2">
              {currentStory.branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchChange(branch.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md ${
                    branch.id === currentBranch?.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {branch.title || `Branch ${branch.id.substring(0, 8)}`}
                  {branch.is_main && ' (Main)'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Story content */}
      <div className="mb-8">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : contributions.length > 0 ? (
          <div>
            {contributions.map((contribution, index) => (
              <Contribution
                key={contribution.id}
                contribution={contribution}
                onVote={handleVote}
                isBeginning={contribution.is_beginning}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">This branch has no contributions yet.</p>
          </div>
        )}
      </div>
      
      {/* Contribution form */}
      <ContributionForm storyId={id} branchId={currentBranch?.id} />
      
      {/* Share section */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Share this story</h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }}
            className="btn btn-outline flex items-center"
          >
            <FiShare2 className="mr-1" />
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;

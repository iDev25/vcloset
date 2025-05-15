import { useState } from 'react';
import { FiSend, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore';
import { useStoryStore } from '../../stores/storyStore';
import { sendContribution } from '../../lib/socket';

const ContributionForm = ({ storyId, branchId }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuthStore();
  const { addContribution } = useStoryStore();
  
  const validateContent = () => {
    setError('');
    
    if (!content.trim()) {
      setError('Please enter some content');
      return false;
    }
    
    // Check if content ends with proper punctuation
    const lastChar = content.trim().slice(-1);
    const validEndings = ['.', '!', '?', '"', '\'', ')', ']', '}'];
    
    if (!validEndings.includes(lastChar)) {
      setError('Your contribution should end with proper punctuation (., !, ?)');
      return false;
    }
    
    // Check if content is roughly one sentence
    const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
    
    if (sentenceCount > 1) {
      setError('Please limit your contribution to one sentence');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be signed in to contribute');
      return;
    }
    
    if (!validateContent()) return;
    
    setIsSubmitting(true);
    
    try {
      // Add contribution to the database
      const result = await addContribution(storyId, {
        userId: user.id,
        content: content.trim(),
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Emit the contribution via WebSocket
      sendContribution(storyId, {
        userId: user.id,
        content: content.trim(),
        branchId,
      });
      
      // Clear the form
      setContent('');
    } catch (error) {
      setError(error.message || 'Failed to submit contribution');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600 mb-2">Sign in to contribute to this story</p>
        <a href="/auth" className="btn btn-primary">Sign In</a>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium mb-3">Add to the story</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <FiAlertCircle className="mr-2 mt-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input min-h-[100px]"
            placeholder="Continue the story with one sentence..."
            maxLength={280}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/280
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Submitting...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Contribute
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContributionForm;

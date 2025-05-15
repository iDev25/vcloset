import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiPlus, FiX } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';

const CreateStoryPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});
  
  const { user } = useAuthStore();
  const { createStory, isLoading } = useStoryStore();
  const navigate = useNavigate();
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!initialContent.trim()) {
      newErrors.initialContent = 'Initial content is required';
    } else {
      // Check if content ends with proper punctuation
      const lastChar = initialContent.trim().slice(-1);
      const validEndings = ['.', '!', '?', '"', '\'', ')', ']', '}'];
      
      if (!validEndings.includes(lastChar)) {
        newErrors.initialContent = 'Your content should end with proper punctuation (., !, ?)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await createStory({
      title: title.trim(),
      description: description.trim(),
      initialContent: initialContent.trim(),
      tags,
      userId: user.id
    });
    
    if (result.storyId) {
      navigate(`/story/${result.storyId}`);
    }
  };
  
  const handleAddTag = (e) => {
    e.preventDefault();
    
    if (!currentTag.trim()) return;
    
    // Don't add duplicate tags
    if (!tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
    }
    
    setCurrentTag('');
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Story</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter a captivating title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`input min-h-[80px] ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Provide a brief description of your story"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="initialContent" className="block text-gray-700 font-medium mb-2">
              Initial Content
            </label>
            <textarea
              id="initialContent"
              value={initialContent}
              onChange={(e) => setInitialContent(e.target.value)}
              className={`input min-h-[120px] ${errors.initialContent ? 'border-red-500' : ''}`}
              placeholder="Start your story with a compelling opening..."
            />
            {errors.initialContent && (
              <p className="text-red-500 text-sm mt-1">{errors.initialContent}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              This will be the beginning of your story. Make it engaging to attract contributors!
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
              Tags
            </label>
            <div className="flex">
              <input
                id="tags"
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                className="input flex-grow"
                placeholder="Add tags (e.g., fantasy, mystery)"
              />
              <button
                onClick={handleAddTag}
                type="button"
                className="ml-2 btn btn-primary"
              >
                <FiPlus />
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <div 
                    key={index}
                    className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full flex items-center"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Creating...
                </span>
              ) : (
                'Create Story'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryPage;

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useStoryStore = create((set, get) => ({
  stories: [],
  currentStory: null,
  currentBranch: null,
  contributions: [],
  isLoading: false,
  error: null,
  
  // Fetch all stories for browsing
  fetchStories: async (filters = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      let query = supabase
        .from('stories')
        .select('*');
      
      // Apply filters if provided
      if (filters.tag) {
        query = query.contains('tags', [filters.tag]);
      }
      
      if (filters.creator) {
        query = query.eq('creator_id', filters.creator);
      }
      
      // Sort by date (newest first by default)
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ stories: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  // Fetch a single story with its branches
  fetchStory: async (storyId) => {
    set({ isLoading: true, error: null, currentStory: null });
    
    try {
      // Get the story details
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select(`
          *,
          creator:profiles(username, avatar_url)
        `)
        .eq('id', storyId)
        .single();
      
      if (storyError) throw storyError;
      
      // Get the story branches
      const { data: branches, error: branchesError } = await supabase
        .from('story_branches')
        .select('*')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });
      
      if (branchesError) throw branchesError;
      
      // Find the main branch
      const mainBranch = branches.find(branch => branch.is_main) || branches[0];
      
      set({ 
        currentStory: { ...story, branches }, 
        currentBranch: mainBranch,
        isLoading: false 
      });
      
      // Fetch contributions for the main branch
      get().fetchContributions(mainBranch.id);
      
      return { story, branches };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Change the current branch being viewed
  changeBranch: async (branchId) => {
    const { currentStory } = get();
    if (!currentStory) return;
    
    const branch = currentStory.branches.find(b => b.id === branchId);
    if (!branch) return;
    
    set({ currentBranch: branch });
    get().fetchContributions(branchId);
  },
  
  // Fetch contributions for a branch
  fetchContributions: async (branchId) => {
    set({ isLoading: true, error: null, contributions: [] });
    
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('branch_id', branchId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      set({ contributions: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  // Create a new story
  createStory: async (storyData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Insert the story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: storyData.title,
          description: storyData.description,
          creator_id: storyData.userId,
          tags: storyData.tags || []
        })
        .select()
        .single();
      
      if (storyError) throw storyError;
      
      // Create the main branch
      const { data: branch, error: branchError } = await supabase
        .from('story_branches')
        .insert({
          story_id: story.id,
          title: 'Main Branch',
          is_main: true
        })
        .select()
        .single();
      
      if (branchError) throw branchError;
      
      // Add the initial contribution if provided
      if (storyData.initialContent) {
        const { error: contribError } = await supabase
          .from('contributions')
          .insert({
            branch_id: branch.id,
            user_id: storyData.userId,
            content: storyData.initialContent,
            position: 0,
            is_beginning: true
          });
        
        if (contribError) throw contribError;
      }
      
      set({ isLoading: false });
      return { storyId: story.id };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  // Add a contribution to a story branch
  addContribution: async (storyId, contributionData) => {
    const { currentBranch, contributions } = get();
    if (!currentBranch) return { error: 'No active branch' };
    
    set({ isLoading: true, error: null });
    
    try {
      // Calculate the next position
      const nextPosition = contributions.length;
      
      const { data, error } = await supabase
        .from('contributions')
        .insert({
          branch_id: currentBranch.id,
          user_id: contributionData.userId,
          content: contributionData.content,
          position: nextPosition
        })
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      // Update local state
      set({ 
        contributions: [...contributions, data],
        isLoading: false 
      });
      
      return { data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  // Create a new branch from an existing contribution
  createBranch: async (contributionId, branchData) => {
    const { currentStory, currentBranch, contributions } = get();
    if (!currentStory || !currentBranch) return { error: 'No active story' };
    
    set({ isLoading: true, error: null });
    
    try {
      // Find the contribution to branch from
      const contribution = contributions.find(c => c.id === contributionId);
      if (!contribution) throw new Error('Contribution not found');
      
      // Create the new branch
      const { data: branch, error: branchError } = await supabase
        .from('story_branches')
        .insert({
          story_id: currentStory.id,
          title: branchData.title,
          parent_branch_id: currentBranch.id,
          fork_position: contribution.position
        })
        .select()
        .single();
      
      if (branchError) throw branchError;
      
      // Copy all contributions up to the fork point
      const contributionsToCopy = contributions.filter(c => c.position <= contribution.position);
      
      for (const contrib of contributionsToCopy) {
        await supabase
          .from('contributions')
          .insert({
            branch_id: branch.id,
            user_id: contrib.user_id,
            content: contrib.content,
            position: contrib.position,
            is_beginning: contrib.is_beginning
          });
      }
      
      // Add the new contribution that starts this branch
      if (branchData.content) {
        await supabase
          .from('contributions')
          .insert({
            branch_id: branch.id,
            user_id: branchData.userId,
            content: branchData.content,
            position: contribution.position + 1
          });
      }
      
      // Update the story in state
      const updatedBranches = [...currentStory.branches, branch];
      set({ 
        currentStory: { ...currentStory, branches: updatedBranches },
        currentBranch: branch,
        isLoading: false 
      });
      
      // Fetch contributions for the new branch
      get().fetchContributions(branch.id);
      
      return { branchId: branch.id };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  // Vote on a contribution
  voteOnContribution: async (contributionId, voteType) => {
    const { user } = useAuthStore.getState();
    if (!user) return { error: 'Not authenticated' };
    
    set({ isLoading: true, error: null });
    
    try {
      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('contribution_id', contributionId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let result;
      
      if (existingVote) {
        // Update existing vote
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same button
          result = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Change vote type
          result = await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        result = await supabase
          .from('votes')
          .insert({
            contribution_id: contributionId,
            user_id: user.id,
            vote_type: voteType
          });
      }
      
      if (result.error) throw result.error;
      
      // Refresh the contributions to get updated vote counts
      const { currentBranch } = get();
      if (currentBranch) {
        get().fetchContributions(currentBranch.id);
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  // Update vote counts in local state (used by WebSocket updates)
  updateVotes: (storyId, contributionId, votes) => {
    const { contributions } = get();
    const updatedContributions = contributions.map(c => 
      c.id === contributionId 
        ? { ...c, upvotes: votes.upvotes, downvotes: votes.downvotes }
        : c
    );
    
    set({ contributions: updatedContributions });
  },
  
  // Clear current story data
  clearStory: () => {
    set({
      currentStory: null,
      currentBranch: null,
      contributions: []
    });
  }
}));

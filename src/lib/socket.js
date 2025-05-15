import { io } from 'socket.io-client';
import { useStoryStore } from '../stores/storyStore';

// We'll use the same domain for WebSockets in this example
// In production, you might have a separate WebSocket server
const SOCKET_URL = import.meta.env.PROD 
  ? window.location.origin 
  : 'http://localhost:3001';

let socket;

export const initializeSocket = (userId) => {
  if (socket) return socket;
  
  socket = io(SOCKET_URL, {
    auth: { userId },
    transports: ['websocket'],
  });
  
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
  
  // Listen for story updates
  socket.on('story:update', (data) => {
    const { addContribution, updateVotes } = useStoryStore.getState();
    
    if (data.type === 'new_contribution') {
      addContribution(data.storyId, data.contribution);
    } else if (data.type === 'vote_update') {
      updateVotes(data.storyId, data.contributionId, data.votes);
    }
  });
  
  return socket;
};

export const joinStoryRoom = (storyId) => {
  if (!socket) return;
  socket.emit('join:story', { storyId });
};

export const leaveStoryRoom = (storyId) => {
  if (!socket) return;
  socket.emit('leave:story', { storyId });
};

export const sendContribution = (storyId, contribution) => {
  if (!socket) return;
  socket.emit('story:contribute', { storyId, contribution });
};

export const sendVote = (storyId, contributionId, voteType) => {
  if (!socket) return;
  socket.emit('story:vote', { storyId, contributionId, voteType });
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

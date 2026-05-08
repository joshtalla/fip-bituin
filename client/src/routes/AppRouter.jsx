import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PromptBoard from '../pages/PromptBoard';
import Profile from '../pages/Profile';
import Explore from '../pages/Explore';
import Search from '../pages/Search';
import CreatePost from '../pages/CreatePost';
import NotFound from '../pages/NotFound';
import ThreadView from '../pages/ThreadView';

// Import your new components
import ProtectedRoute from './ProtectedRoute';
import MyPosts from '../pages/MyPosts';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
      
      <Route path="/prompts" element={<PromptBoard />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/search" element={<Search />} />
      <Route path="/prompts/create" element={<CreatePost />} />
      <Route path="/prompts/:postId" element={<ThreadView />} />
      
      {/* Profile Routes */}
      <Route path="/profile" element={<Profile />} />
      
      {/* Protected "My Posts" Route */}
      <Route 
        path="/profile/my-posts" 
        element={
          <ProtectedRoute>
            <MyPosts />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
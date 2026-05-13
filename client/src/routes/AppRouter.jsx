import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PromptBoard from '../pages/PromptBoard';
import Search from '../pages/Search';
import CreatePost from '../pages/CreatePost';
import NotFound from '../pages/NotFound';
import PostDetail from '../pages/PostDetail';
import Profile from '../pages/Profile';
import Explore from '../pages/Explore';
import MyPosts from '../pages/MyPosts';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/prompts" replace />} />

      {/* Unauthenticated routes (redirects to prompts if already logged in) */}
      <Route element={<ProtectedRoute requireAuth={false} redirectTo="/prompts" />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
      </Route>

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        {/* Pages that use the shared AppLayout (Global Navbar) */}
        <Route element={<AppLayout />}>
          <Route path="/prompts" element={<PromptBoard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/prompt/:postId" element={<PostDetail />} />
          <Route path="/prompts/:postId" element={<PostDetail />} />
        </Route>

        {/* Pages that render their own Navbar or don't need AppLayout */}
        <Route path="/prompts/create" element={<CreatePost />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/my-posts" element={<MyPosts />} />
        <Route path="/explore" element={<Explore />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
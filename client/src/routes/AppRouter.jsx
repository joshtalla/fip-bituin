import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PromptBoard from '../pages/PromptBoard';
import CreatePost from '../pages/CreatePost';
import NotFound from '../pages/NotFound';
import PostDetail from '../pages/PostDetail';
import Profile from '../pages/Profile';
import Explore from '../pages/Explore';
import MyPosts from '../pages/MyPosts';
import ChangeLanguage from '../pages/ChangeLanguage';
import ChangePassword from '../pages/ChangePassword';
import ChangeEmail from '../pages/ChangeEmail';
import SavedPosts from '../pages/SavedPosts';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';
import MyComments from '../pages/MyComments';

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
          <Route path="/search" element={<Navigate to="/explore" replace />} />
          <Route path="/prompt/:postId" element={<PostDetail />} />
          <Route path="/prompts/:postId" element={<PostDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/my-comments" element={<MyComments />} />
          <Route path="/profile/change-location" element={<NotFound />} />
          <Route path="/profile/change-language" element={<ChangeLanguage />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          <Route path="/profile/change-email" element={<ChangeEmail />} />
          <Route path="/profile/*" element={<Navigate to="/prompts" replace />} />
          <Route path="/explore" element={<Explore />} />
        </Route>

        {/* Pages that render their own Navbar or don't need AppLayout */}
        <Route path="/prompts/create" element={<CreatePost />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/my-posts" element={<MyPosts />} />
        <Route path="/profile/saved-posts" element={<SavedPosts />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
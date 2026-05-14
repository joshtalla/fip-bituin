import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import PromptBoard from '../pages/PromptBoard';
import Search from '../pages/Search';
import CreatePost from '../pages/CreatePost';
import NotFound from '../pages/NotFound';
import PostDetail from '../pages/PostDetail';
import Profile from '../pages/Profile';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from './AppLayout';
import MyComments from '../pages/MyComments';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/prompts" replace />} />

      <Route element={<ProtectedRoute requireAuth={false} redirectTo="/prompts" />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/prompts" element={<PromptBoard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/prompt/:postId" element={<PostDetail />} />
          <Route path="/prompts/:postId" element={<PostDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/my-comments" element={<MyComments />} />
          <Route path="/profile/saved-posts" element={<NotFound />} />
          <Route path="/profile/change-location" element={<NotFound />} />
          <Route path="/profile/change-language" element={<NotFound />} />
          <Route path="/profile/my-posts" element={<NotFound />} />
          <Route path="/profile/change-password" element={<NotFound />} />
          <Route path="/profile/change-email" element={<NotFound />} />
          <Route path="/explore" element={<Navigate to="/prompts" replace />} />
        </Route>
        <Route path="/prompts/create" element={<CreatePost />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
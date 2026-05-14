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
import MyComments from '../pages/MyComments';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
      <Route path="/prompts" element={<PromptBoard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/saved-posts" element={<NotFound />} />
      <Route path="/profile/change-location" element={<NotFound />} />
      <Route path="/profile/change-language" element={<NotFound />} />
      <Route path="/profile/my-comments" element={<MyComments />} />
      <Route path="/profile/my-posts" element={<NotFound />} />
      <Route path="/profile/change-password" element={<NotFound />} />
      <Route path="/profile/change-email" element={<NotFound />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/search" element={<Search />} />
      <Route path="/prompts/create" element={<CreatePost />} />
      <Route path="/prompts/:postId" element={<ThreadView />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
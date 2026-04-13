// In the case of adding more pages: import *page-name* from ../pages/*page-name*
import { Routes, Route } from 'react-router-dom';
import Profile from '../pages/Profile';
import Explore from '../pages/Explore';
import Search from '../pages/Search';
import NotFound from '../pages/NotFound';

const AppRouter = () =>{
    return(
        <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRouter;


// Mock Data is being used for this implementation!!!
import { mockPosts } from "../mocks/mockData";

import './pages-css/ThreadView.css';
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Navbar from '../components/Navbar'
import exit_button from '../components/exit-prompt.png'
import pfp from '../components/pfp-temp.png'
import pinpoint from '../components/pinpoint.png'

// Items next to the translate button
import comment_active from '../components/comment-button-active.png'
import comment_unactive from '../components/comment-button-unactive.png'
import heart_active from '../components/heart-button-active.png'
import heart_unactive from '../components/heart-button-unactive.png'
import bookmark_active from '../components/bookmark-button-active.png'
import bookmark_unactive from '../components/bookmark-button-unactive.png'


export default function ThreadView(){
    const { postId } = useParams();
    const post = mockPosts.find((p) => p.id === postId)

    if (!post) return <div>This post cannot be found!</div>;

    const navigate = useNavigate();
    const [commentActive, setCommentActive] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [heartActive, setHeartActive] = useState(false);
    const [bookmarkActive, setBookmarkActive] = useState(false);
    return(
        <div className="prompt-container" style={{minHeight: '20vh'}}>
            <Navbar/>
                <div className="true-container">
                    <button onClick={() => navigate("/prompts")}>
                        <img 
                        className="exit-button-img"
                        src={exit_button}
                        />
                    </button>

                    {/* Username and Location */}
                    <div className="content-row">
                        <img className="pfp-img" src={pfp}></img>
                        <h1 className="username">{post.anonymous_name}</h1>
                        <img className="pin-img" src={pinpoint}></img>
                        <h1 className="location">location, country</h1>
                    </div>

                    {/* Main Content | User's Comment */}
                    <p className="content">
                        {post.content}
                    </p>

                    {/* Translate, Comment, Heart, Bookmark, More Options */}
                    <div className="content-row-below">
                        <button className="translate-button">
                            translate
                        </button>
                        <img 
                        className='comment-button'
                        src={commentActive ? comment_active : comment_unactive}
                        alt="comment button"
                        onClick={() => setCommentActive(prev => !prev)}
                        />
                        <img 
                        className='comment-button'
                        src={heartActive ? heart_active : heart_unactive}
                        alt="heart button"
                        onClick={() => setHeartActive(prev => !prev)}
                        />
                        <img 
                        className='comment-button'
                        src={bookmarkActive ? bookmark_active : bookmark_unactive}
                        alt="bookmark button"
                        onClick={() => setBookmarkActive(prev => !prev)}
                        />
                        <button className="more-actions-button">...</button>
                    </div>
                    {commentActive && (
                        <div className="comment-input-container">
                            <textarea
                                className="comment-input"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="reply!"
                            />
                            <div className='comment-actions'>
                                <button className="comment-cancel">cancel</button>
                                <button className="comment-publish">publish</button>
                            </div>
                        </div>
                    )}
                </div>
        </div>
    )
}

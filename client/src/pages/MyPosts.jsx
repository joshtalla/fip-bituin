import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Stars from '../components/Stars';
import { getMyPosts } from '../services/postService';

function formatPostDate(value) {
  if (!value) {
    return 'Posted recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Posted recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getMyPosts();
        setPosts(response.posts || []);
      } catch (err) {
        setError("Failed to load your posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #07133B, #682B1D)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <Stars count={150} />
      <Navbar />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '120px 60px 72px 60px',
        position: 'relative',
        zIndex: 1,
      }}>
        
        {/* Header Section */}
        <div style={{ width: '100%', maxWidth: '800px', marginBottom: '32px' }}>
          <Link 
            to="/profile" 
            style={{ color: '#EFB758', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '16px' }}
          >
            ← back to profile
          </Link>
          <h1 style={{
            color: '#FFFCEF',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '36px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            my posts
          </h1>
        </div>

        {/* Content Section */}
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* STATE 1: Loading */}
          {isLoading && (
            <p style={{ color: '#FBF3E5', fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
              loading your universe...
            </p>
          )}

          {/* STATE 2: Error */}
          {!isLoading && error && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ff6b6b', fontFamily: 'Poppins, sans-serif' }}>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                style={{ background: '#EFB758', color: '#4C383A', padding: '8px 16px', borderRadius: '8px', border: 'none', fontFamily: 'Darumadrop One, cursive', fontSize: '20px', cursor: 'pointer', marginTop: '10px' }}
              >
                retry
              </button>
            </div>
          )}

          {/* STATE 3: Empty */}
          {!isLoading && !error && posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <p style={{ color: '#FBF3E5', fontFamily: 'Poppins, sans-serif', fontSize: '18px' }}>
                You haven't placed any stars in the sky yet.
              </p>
              <button 
                onClick={() => navigate('/prompts')}
                style={{ background: '#EFB758', color: '#4C383A', padding: '12px 24px', borderRadius: '8px', border: 'none', fontFamily: 'Darumadrop One, cursive', fontSize: '20px', cursor: 'pointer', marginTop: '20px' }}
              >
                go to prompts
              </button>
            </div>
          )}

          {/* STATE 4: Success (List of Posts) */}
          {!isLoading && !error && posts.length > 0 && posts.map(post => (
            <div 
              key={post.id}
              onClick={() => navigate(`/prompts/${post.id}`)}
              style={{
                background: '#FBF3E5',
                padding: '24px',
                borderRadius: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#888', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                  {formatPostDate(post.created_at)}
                </span>
                <span style={{ color: '#EFB758', fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 'bold' }}>
                  {post.likes_count} likes
                </span>
              </div>
              <p style={{ color: '#4C383A', fontFamily: 'Poppins, sans-serif', margin: 0, fontSize: '16px' }}>
                {post.content}
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
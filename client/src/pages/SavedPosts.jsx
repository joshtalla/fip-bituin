import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Stars from '../components/Stars';
import { mockPosts } from '../mocks/mockData';

// Temporary mock function for fetching "Saved Posts"
const fetchSavedPosts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Return a different subset to simulate saved posts
  return mockPosts.slice(4, 8); 
};

export default function SavedPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with real API call when Justin finishes the backend
        const saved = await fetchSavedPosts();
        setPosts(saved);
      } catch (err) {
        setError("Failed to load your saved posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleUnsave = async (e, postId) => {
    e.stopPropagation(); // Prevents the click from opening the post detail page
    
    // OPTIMISTIC UI UPDATE: Instantly remove from the screen to make it feel fast
    const previousPosts = [...posts];
    setPosts(current => current.filter(p => p.id !== postId));

    try {
      // TODO: Replace with real DELETE request when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      // throw new Error("Mock API Failure"); // uncomment to test rollback!
    } catch (err) {
      // If the backend fails, put the post back and warn the user
      setPosts(previousPosts);
      alert("Failed to remove saved post. Please try again.");
    }
  };

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
            saved posts
          </h1>
        </div>

        {/* Content Section */}
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* STATE 1: Loading */}
          {isLoading && (
            <p style={{ color: '#FBF3E5', fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
              retrieving your constellations...
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
                You have no saved posts yet.
              </p>
              <button 
                onClick={() => navigate('/prompts')}
                style={{ background: '#EFB758', color: '#4C383A', padding: '12px 24px', borderRadius: '8px', border: 'none', fontFamily: 'Darumadrop One, cursive', fontSize: '20px', cursor: 'pointer', marginTop: '20px' }}
              >
                explore posts
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
                <span style={{ color: '#888', fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 'bold' }}>
                  @{post.anonymous_name}
                </span>
                
                {/* The Unsave Button */}
                <button 
                  onClick={(e) => handleUnsave(e, post.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#765C5F',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  unsave
                </button>
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
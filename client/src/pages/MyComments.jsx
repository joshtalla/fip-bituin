import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/auth-context'
import MyCommentCard from '../components/MyCommentCard'
import ProfileNavBar from '../components/ProfileNavBar'
import { getMyReplies } from '../services/replyService'

/**
 * MyComments
 *
 * Profile sub-page that lists every reply the authenticated user has authored.
 * Renders as a grid of 92x92 yellow stars (one per comment) with a hover
 * overlay that reveals the comment excerpt + thread context. Clicking a star
 * navigates to the owning thread so the user can continue the conversation.
 *
 * Wired to GET /api/users/me/replies on the Express backend. The endpoint
 * already enforces bearer-token auth, so the page just passes the active
 * Supabase access token along.
 */

const MyComments = () => {
    const { user, loading: authLoading } = useContext(AuthContext)
    const navigate = useNavigate()

    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sortOrder, setSortOrder] = useState('desc')

    useEffect(() => {
        // Wait for auth bootstrap to finish before deciding what to fetch.
        if (authLoading) {
            return
        }

        if (!user) {
            // Route protection already redirects unauthenticated users to /login,
            // so reaching this branch usually means a transient state. Show the
            // empty UI instead of failing.
            setComments([])
            setLoading(false)
            return
        }

        let cancelled = false

        const loadComments = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await getMyReplies(sortOrder)

                if (!cancelled) {
                    setComments(response?.replies || [])
                }
            } catch (loadError) {
                if (!cancelled) {
                    console.error('Failed to load my comments:', loadError)
                    setError('Something went wrong. Please try again.')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadComments()

        return () => {
            cancelled = true
        }
    }, [user, authLoading, sortOrder])

    const handleCommentSelect = (postId) => {
        if (!postId) return
        navigate(`/prompts/${postId}`)
    }

    const toggleSort = () => {
        setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'))
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #07133B, #682B1D)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Note: Stars background is rendered globally in App.jsx. The
                AppLayout-level Navbar is rendered by the router wrapper. */}

            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '40px 60px 60px 60px',
                }}
            >
                {/* Profile sub-page nav: constellation strip with active state. */}
                <ProfileNavBar />

                {/* Sort control row */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '32px',
                        marginBottom: '24px',
                    }}
                >
                    <button
                        type="button"
                        onClick={toggleSort}
                        aria-label={`Sort comments by date ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
                        style={{
                            backgroundColor: '#8C97BC',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            height: '32px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            boxShadow: '2px 2px 4px rgba(0,0,0,0.25)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        sort by {sortOrder === 'desc' ? '↓' : '↑'}
                    </button>
                </div>

                {/* States */}
                {loading && (
                    <div
                        style={{
                            color: '#FFFFFF',
                            textAlign: 'center',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '18px',
                            marginTop: '48px',
                        }}
                    >
                        loading your comments...
                    </div>
                )}

                {!loading && error && (
                    <div
                        role="alert"
                        style={{
                            color: '#FFE9B7',
                            background: 'rgba(122,40,40,0.45)',
                            border: '1px solid rgba(255,233,183,0.4)',
                            borderRadius: '12px',
                            padding: '20px',
                            textAlign: 'center',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '16px',
                            maxWidth: '480px',
                            margin: '48px auto 0',
                        }}
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && comments.length === 0 && (
                    <div
                        style={{
                            color: '#FFFFFF',
                            textAlign: 'center',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '18px',
                            marginTop: '64px',
                            opacity: 0.85,
                        }}
                    >
                        you haven't made any comments yet.
                        <div
                            style={{
                                marginTop: '8px',
                                fontSize: '14px',
                                opacity: 0.7,
                            }}
                        >
                            reply to a prompt to leave your first star here.
                        </div>
                    </div>
                )}

                {/* Star grid - 6 columns per Figma. Wraps responsively below. */}
                {!loading && !error && comments.length > 0 && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '24px',
                            justifyItems: 'center',
                            maxWidth: '1080px',
                            margin: '0 auto',
                        }}
                    >
                        {comments.map((comment) => (
                            <MyCommentCard
                                key={comment.id}
                                comment={comment}
                                onSelect={handleCommentSelect}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyComments

import { useState } from 'react'
import { PromptStarIcon } from './StarPost'

/**
 * MyCommentCard
 *
 * Single comment in the My Comments grid. Visually a 92x92 yellow star.
 *
 * Behavior:
 *   - Hover (mouse enter): opens an overlay popup showing the comment
 *     author's anonymous name, the comment excerpt, and the thread context
 *     (which prompt or post it lives under) so the user knows where the
 *     conversation happened. The overlay matches the Figma's "view other
 *     user" overlay slot with a 300ms dissolve.
 *   - Click: invokes onSelect with the comment's post id so the parent can
 *     navigate to that thread.
 *
 * Props:
 *   - comment: {
 *       id, post_id, anonymous_name, content, created_at,
 *       thread: { prompt_title, post_excerpt, ... } | null
 *     }
 *   - onSelect: (postId: string) => void
 */

const formatRelativeTimestamp = (value) => {
    if (!value) return ''
    const timestamp = new Date(value)
    if (Number.isNaN(timestamp.getTime())) return ''
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(timestamp)
}

const MyCommentCard = ({ comment, onSelect }) => {
    const [hovered, setHovered] = useState(false)

    const handleClick = () => {
        if (typeof onSelect === 'function') {
            onSelect(comment.post_id)
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
        }
    }

    const threadLabel = comment.thread?.prompt_title
        || comment.thread?.post_excerpt
        || comment.thread?.post_author
        || 'a thread'

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`Open thread for comment by ${comment.anonymous_name}`}
            style={{ position: 'relative', display: 'inline-block', outline: 'none' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            <div
                style={{
                    filter: hovered
                        ? 'brightness(1.15) drop-shadow(0 4px 12px rgba(239,183,88,0.45))'
                        : 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
                    transition: 'filter 0.3s ease',
                    display: 'block',
                }}
            >
                <PromptStarIcon
                    alt="Open comment thread"
                    className="h-20 w-20 cursor-pointer sm:h-24 sm:w-24"
                />
            </div>

            {/* Hover overlay: 300ms dissolve, ease out, per Figma interaction. */}
            <div
                role="dialog"
                aria-hidden={!hovered}
                style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 12px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#FBF3E5',
                    borderRadius: '12px',
                    padding: '16px',
                    width: '300px',
                    zIndex: 20,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                    opacity: hovered ? 1 : 0,
                    pointerEvents: hovered ? 'auto' : 'none',
                    transition: 'opacity 300ms ease-out',
                }}
            >
                {/* Author row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#4C383A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FBF3E5',
                            fontSize: '18px',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                        aria-hidden="true"
                    >
                        {comment.anonymous_name ? comment.anonymous_name.slice(0, 1).toUpperCase() : '?'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 600,
                                color: '#1a1a1a',
                                fontSize: '14px',
                                lineHeight: 1.2,
                            }}
                        >
                            {comment.anonymous_name || 'anonymous'}
                        </span>
                        {comment.created_at && (
                            <span
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11px',
                                    color: '#7a6c6e',
                                    marginTop: '2px',
                                }}
                            >
                                {formatRelativeTimestamp(comment.created_at)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment excerpt */}
                <p
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        color: '#333',
                        margin: 0,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {comment.content || (comment.media_url ? '(media attachment)' : '')}
                </p>

                {/* Thread context */}
                <div
                    style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(76,56,58,0.15)',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        color: '#4C383A',
                    }}
                >
                    <span style={{ opacity: 0.7 }}>on </span>
                    <span style={{ fontWeight: 600 }}>{threadLabel}</span>
                </div>
            </div>
        </div>
    )
}

export default MyCommentCard

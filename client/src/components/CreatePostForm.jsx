import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { fetchJson } from '../services/api'

function CreatePostForm({ promptId, promptText }) {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const MAX = 1000

  const handlePublish = async () => {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) throw new Error('Not authenticated')

      const data = await fetchJson('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt_id: promptId,
          content: content,
        })
      })
      navigate(`/prompts/${data.id}`)
    } catch (publishError) {
      setError(publishError.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const publishDisabled = !promptId || content.length === 0 || content.length > MAX || loading

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #07133B, #682B1D)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 60px',
      }}>
        <span style={{ color: '#E8A020', fontSize: '64px', fontFamily: 'Darumadrop One', fontWeight: '400' }}>bituin.</span>
        <div style={{ display: 'flex', gap: '32px', color: 'white', fontSize: '24px', fontFamily: 'Poppins', fontWeight: '500' }}>
          <span>profile</span>
          <span>explore</span>
          <span>search</span>
        </div>
      </nav>

      {/* Page content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 60px 72px 60px',
      }}>

        {/* Card */}
        <div style={{
          background: '#F5F0E4',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>

          {/* X button */}
          <div>
            <button
              onClick={() => navigate('/prompts')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '35px',
                fontFamily: 'Livvic',
                fontWeight: '700',
                cursor: 'pointer',
                color: '#333',
                padding: 0,
              }}
            >
              x
            </button>
          </div>

          {/* Prompt text */}
          <p style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: 0,
            lineHeight: '1.5',
          }}>
            {promptText || 'Choose a prompt from the board before creating a post.'}
          </p>

          {/* Textarea container */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="enter your text"
              rows={8}
              style={{
                width: '100%',
                background: '#EDE8D8',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                color: '#333',
              }}
            />
            {/* Add media button — inside textarea bottom-right */}
            <button
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: '#5a4a5a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: 'Darumadrop One',
                fontSize: '24px',
                fontWeight: '400',
              }}
            >
              add media
            </button>
          </div>

          {/* Character count */}
          <div style={{ textAlign: 'right', fontSize: '13px', color: content.length > MAX ? 'red' : '#888' }}>
            {content.length} / {MAX}
          </div>

          {!promptId && (
            <p style={{ color: '#8A3B2E', margin: 0 }}>
              Open this page from today&apos;s prompt to attach your post correctly.
            </p>
          )}

          {/* Translate button — below textarea, left aligned */}
          <div>
            <button
              disabled
              style={{
                background: '#8a90b0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontFamily: 'Darumadrop One',
                fontSize: '24px',
                fontWeight: '400',
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
            >
              translate
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p style={{ color: 'red', textAlign: 'center', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Publish button — centered, inside card bottom */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <button
            onClick={handlePublish}
              disabled={publishDisabled}
              style={{
                background: publishDisabled ? '#ccc' : '#E8A020',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 48px',
                fontFamily: 'Darumadrop One',
                fontSize: '24px',
                fontWeight: '400',
                cursor: publishDisabled ? 'not-allowed' : 'pointer',

              }}
            >
              {loading ? 'publishing...' : 'publish'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CreatePostForm

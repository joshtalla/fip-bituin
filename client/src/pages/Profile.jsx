import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Stars from '../components/Stars'
import { supabase } from '../services/supabaseClient'

const constellations = [
    { label: 'saved posts', route: '/profile/saved-posts', x: '35%', y: '25%',
      dots: [{cx:40,cy:30},{cx:60,cy:50},{cx:80,cy:40},{cx:95,cy:55},{cx:70,cy:75},{cx:50,cy:65}],
      lines: [
        {x1:40, y1:30, x2:60, y2:50}, 
        {x1:60, y1:50, x2:80, y2:40}, 
        {x1:80, y1:40, x2:95, y2:55}, 
        {x1:60, y1:50, x2:50, y2:65}, 
        {x1:50, y1:65, x2:70, y2:75}, 
        {x1:70, y1:75, x2:80, y2:40}
      ] 
    },
    { label: 'change location', route: '/profile/change-location', x: '65%', y: '25%',
      dots: [{cx:50,cy:15},{cx:55,cy:35},{cx:65,cy:55},{cx:85,cy:60},{cx:100,cy:55},{cx:75,cy:75}],
      lines: [
        {x1:50, y1:15, x2:55, y2:35}, 
        {x1:55, y1:35, x2:65, y2:55}, 
        {x1:65, y1:55, x2:85, y2:60}, 
        {x1:85, y1:60, x2:100, y2:55}, 
        {x1:65, y1:55, x2:75, y2:75}
      ] 
    },
    { label: 'change language', route: '/profile/change-language', x: '22%', y: '50%',
      dots: [{cx:20,cy:40},{cx:45,cy:25},{cx:65,cy:40},{cx:55,cy:65},{cx:30,cy:60},{cx:80,cy:65}],
      lines: [
        {x1:20, y1:40, x2:45, y2:25}, 
        {x1:45, y1:25, x2:65, y2:40}, 
        {x1:65, y1:40, x2:55, y2:65}, 
        {x1:55, y1:65, x2:30, y2:60}, 
        {x1:30, y1:60, x2:20, y2:40}, 
        {x1:65, y1:40, x2:80, y2:65}
      ] 
    },
    { label: 'my comments', route: '/profile/my-comments', x: '50%', y: '50%',
      dots: [{cx:35,cy:45},{cx:65,cy:40},{cx:80,cy:65},{cx:45,cy:70},{cx:95,cy:85},{cx:35,cy:90}],
      lines: [
        {x1:35, y1:45, x2:65, y2:40}, 
        {x1:65, y1:40, x2:80, y2:65}, 
        {x1:80, y1:65, x2:45, y2:70}, 
        {x1:45, y1:70, x2:35, y2:45}, 
        {x1:80, y1:65, x2:95, y2:85}, 
        {x1:45, y1:70, x2:35, y2:90}
      ] 
    },
    { label: 'my posts', route: '/profile/my-posts', x: '78%', y: '50%',
      dots: [{cx:75,cy:15},{cx:95,cy:35},{cx:105,cy:60},{cx:95,cy:85},{cx:70,cy:70},{cx:55,cy:85},{cx:45,cy:65}],
      lines: [
        {x1:75, y1:15, x2:95, y2:35}, 
        {x1:95, y1:35, x2:105, y2:60}, 
        {x1:105, y1:60, x2:95, y2:85}, 
        {x1:105, y1:60, x2:70, y2:70}, 
        {x1:70, y1:70, x2:55, y2:85}, 
        {x1:70, y1:70, x2:45, y2:65}
      ] 
    },
    { label: 'change password', route: '/profile/change-password', x: '35%', y: '75%',
      dots: [{cx:20,cy:75},{cx:45,cy:65},{cx:70,cy:50},{cx:95,cy:35},{cx:60,cy:80},{cx:75,cy:95}],
      lines: [
        {x1:20, y1:75, x2:45, y2:65}, 
        {x1:45, y1:65, x2:70, y2:50}, 
        {x1:70, y1:50, x2:95, y2:35}, 
        {x1:70, y1:50, x2:60, y2:80}, 
        {x1:60, y1:80, x2:75, y2:95}
      ] 
    },
    { label: 'change email', route: '/profile/change-email', x: '65%', y: '75%',
      dots: [{cx:40,cy:40},{cx:65,cy:30},{cx:85,cy:45},{cx:95,cy:70},{cx:70,cy:90},{cx:45,cy:80},{cx:25,cy:65}],
      lines: [
        {x1:40, y1:40, x2:65, y2:30}, 
        {x1:65, y1:30, x2:85, y2:45}, 
        {x1:85, y1:45, x2:95, y2:70}, 
        {x1:95, y1:70, x2:70, y2:90}, 
        {x1:70, y1:90, x2:45, y2:80}, 
        {x1:45, y1:80, x2:25, y2:65}, 
        {x1:25, y1:65, x2:40, y2:40}
      ] 
    },
]

const ConstellationNode = ({ label, x, y, onClick, dots, lines }) => {
    const [hovered, setHovered] = useState(false)
  
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          textAlign: 'center',
          filter: hovered ? 'brightness(2) drop-shadow(0 0 6px white)' : 'brightness(1)',
          transition: 'filter 0.2s ease',
        }}
      >
        <svg width="120" height="120" style={{ display: 'block', margin: '0 auto' }}>
          {lines && lines.map((line, i) => (
            <line
              key={`line-${i}`}
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke="white" strokeWidth="1" strokeOpacity="0.7"
            />
          ))}
          {dots && dots.map((dot, i) => (
            <circle key={`dot-${i}`} cx={dot.cx} cy={dot.cy} r="3.5" fill="white" fillOpacity="1" />
          ))}
        </svg>
        <span style={{
          color: 'white',
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '400',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </div>
    )
}

const Profile = () => {
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [fading, setFading] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      const { data } = await supabase
      .from('users')
      .select('username')
      .eq('auth_user_id', user.id)
      .single()
    if (data) setUsername(data.username)
    }
    fetchUsername()
  }, [])

  const handleConstellationClick = (route) => {
    setFading(true)
    setTimeout(() => {
      navigate(route)
    }, 400)
  }

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #07133B, #682B1D)',
      position: 'relative',
      overflow: 'hidden',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.4s ease',
    }}>
      <Stars />
      <Navbar />

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '80px 0 40px 0',
        boxSizing: 'border-box',
      }}>

        {/* Greeting */}
        <h1 style={{
          color: '#FFFFFF',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '34px',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center',
        }}>
          kamusta ka, {username}!
        </h1>

        {/* Subheading */}
        <p style={{
          color: '#FFFFFF',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '30px',
          fontWeight: '500',
          margin: '8px 0 0 0',
          textAlign: 'center',
        }}>
          interact with your profile below:
        </p>

        {/* Globe circle */}
        <div style={{
        position: 'relative',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.25)',
        boxShadow: '0 0 40px 8px rgba(239, 183, 88, 0.4), inset 0 0 40px 8px rgba(239, 183, 88, 0.1)',
        border: '2px solid rgba(239, 183, 88, 0.6)',
        marginTop: '20px',
        }}>
        {constellations.map((c) => (
        <ConstellationNode
            key={c.label}
            label={c.label}
            x={c.x}
            y={c.y}
            dots={c.dots}
            lines={c.lines}
            onClick={() => handleConstellationClick(c.route)}
        />
        ))}
        </div>

        {/* Log out button */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              fontFamily: 'Darumadrop One, sans-serif',
              fontSize: '24px',
              fontWeight: '400',
              color: '#4C383A',
              backgroundColor: '#EFB758',
              border: 'none',
              borderRadius: '8px',
              width: '136px',
              height: '51px',
              cursor: 'pointer',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.25)',
            }}
          >
            log out
          </button>
        </div>

      </div>{/* end main content */}

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}>
          <div style={{
            background: '#FBF3E5',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            minWidth: '200px',
          }}>
            <button
              onClick={() => setShowLogoutModal(false)}
              style={{
                display: 'block',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                marginBottom: '8px',
              }}
            >
              x
            </button>
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              color: '#4C383A',
              margin: '0 0 16px 0',
            }}>
              are you sure<br />you want to log out?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#EFB758',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontFamily: 'Darumadrop One, sans-serif',
                  cursor: 'pointer',
                  color: '#4C383A',
                }}
              >
                yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  backgroundColor: '#c0b0b0',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontFamily: 'Darumadrop One, sans-serif',
                  cursor: 'pointer',
                  color: '#4C383A',
                }}
              >
                no
              </button>
            </div>
          </div>
        </div>
      )}

    </div> // end outer wrapper
  )
}

export default Profile
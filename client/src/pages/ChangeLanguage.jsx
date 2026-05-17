import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/auth-context'
import { updateUserLanguage } from '../services/authService'
import { LANGUAGE_OPTIONS, normalizeLanguageCode } from '../utils/language'

const ConstellationHeader = ({ constellation }) => {
  if (!constellation) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5px' }}>
      <svg viewBox="0 0 120 120" width="240" height="240" style={{ display: 'block', margin: '0 auto' }}>
        {constellation.lines?.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
        ))}
        {constellation.dots?.map((dot, index) => (
          <circle key={index} cx={dot.cx} cy={dot.cy} r="3.5" fill="white" />
        ))}
      </svg>
      <span
        style={{
          display: 'inline-block',
          width: '170px',
          color: 'white',
          fontSize: '23px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '600',
          textAlign: 'center',
          lineHeight: 'normal',
        }}
      >
        {constellation.label}
      </span>
    </div>
  )
}

function ChangeLanguage() {
  const { state } = useLocation()
  const constellation = state?.constellation
  const navigate = useNavigate()
  const { user, loading: authLoading, setUser } = useContext(AuthContext)

  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0].value)
  const [constellationVisible, setConstellationVisible] = useState(false)
  const [inputsVisible, setInputsVisible] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setTimeout(() => setConstellationVisible(true), 100)
    setTimeout(() => setInputsVisible(true), 400)
  }, [])

  useEffect(() => {
    if (authLoading) {
      return
    }

    const normalizedLanguage = normalizeLanguageCode(user?.language)

    if (normalizedLanguage) {
      setSelectedLanguage(normalizedLanguage)
    }
  }, [authLoading, user])

  const handleNavigation = (route) => {
    setFadingOut(true)
    setTimeout(() => setInputsVisible(false), 150)
    setTimeout(() => setConstellationVisible(false), 150)
    setTimeout(() => navigate(route), 700)
  }

  const fadeStyle = (visible) => ({
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.4s ease',
    pointerEvents: fadingOut ? 'none' : 'auto',
  })

  const handleSave = async () => {
    if (!user?.authUserId || isSaving) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const updatedProfile = await updateUserLanguage({
        authUserId: user.authUserId,
        language: selectedLanguage,
      })

      setUser((currentUser) => currentUser
        ? {
            ...currentUser,
            language: updatedProfile.language,
          }
        : currentUser)

      setStatusMessage('Language updated successfully.')
      handleNavigation('/profile')
    } catch (error) {
      console.error('Failed to update language:', error)
      setErrorMessage('Unable to save language. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div style={fadeStyle(constellationVisible)}>
        <ConstellationHeader constellation={constellation} />
      </div>

      <div
        style={{
          ...fadeStyle(inputsVisible),
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '4vh',
          gap: '20px',
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <p
            style={{
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '30px',
              fontWeight: '500',
              lineHeight: 'normal',
            }}
          >
            choose your preferred language below:
          </p>
        </div>

        <select
          value={selectedLanguage}
          onChange={(event) => setSelectedLanguage(event.target.value)}
          disabled={authLoading || isSaving}
          style={{
            display: 'flex',
            width: '506px',
            height: '61px',
            padding: '17.848px 26.177px',
            alignItems: 'center',
            gap: '11.899px',
            borderRadius: '8px',
            color: '#765C5F',
            background: '#FBF3E5',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '20px',
            fontStyle: 'italic',
            fontWeight: '500',
            lineHeight: 'normal',
          }}
        >
          {LANGUAGE_OPTIONS.map((languageOption) => (
            <option key={languageOption.value} value={languageOption.value}>
              {languageOption.label}
            </option>
          ))}
        </select>

        {statusMessage && (
          <p
            style={{
              color: '#D8F8D8',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              margin: 0,
            }}
          >
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            style={{
              color: '#FFD1D1',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              margin: 0,
            }}
          >
            {errorMessage}
          </p>
        )}
      </div>

      <div style={{ ...fadeStyle(inputsVisible), width: '100%', display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ paddingRight: '10px' }}>
          <button
            onClick={handleSave}
            disabled={authLoading || isSaving}
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
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: authLoading || isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'saving...' : 'save'}
          </button>
        </div>
        <button
          onClick={() => handleNavigation('/profile')}
          style={{
            fontFamily: 'Darumadrop One, sans-serif',
            fontSize: '24px',
            fontWeight: '400',
            color: 'white',
            backgroundColor: '#765C5F',
            border: 'none',
            borderRadius: '8px',
            width: '136px',
            height: '51px',
            cursor: 'pointer',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.25)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          back
        </button>
      </div>
    </div>
  )
}

export default ChangeLanguage
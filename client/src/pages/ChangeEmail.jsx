
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { set } from 'react-hook-form'

const ConstellationHeader = ({ constellation }) => {
    if (!constellation) return null
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5px' }}>
        <svg viewBox="0 0 120 120"width="240" height="240" style={{ display: 'block', margin: '0 auto' }}>
            {constellation.lines?.map((line, i) => (
            <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke="white" strokeWidth="1" strokeOpacity="0.7" />
            ))}
            {constellation.dots?.map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r="3.5" fill="white" />
            ))}
        </svg>
        <span style={{
            display: 'inline-block',
            width: '150px',
            color: 'white',
            fontSize: '23px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: 'normal',
        }}>
            {constellation.label}
        </span>
        </div>
    )
}

function ChangeEmail() {
    const { state } = useLocation()
    const constellation = state?.constellation
    const navigate = useNavigate();

    const [constellationVisible, setConstellationVisible] = useState(false)
    const [inputsVisible, setInputsVisible] = useState(false)
    const [buttonsVisible, setButtonsVisible] = useState(false)
    const [fadingOut, setFadingOut] = useState(false)

    useEffect(() => {
        setTimeout(() => setConstellationVisible(true), 100)
        setTimeout(() => setInputsVisible(true), 400)
        setTimeout(() => setButtonsVisible(true), 650)
    }, [])

    const handleNavigation = (route) => {
        // fade order
        setFadingOut(true)
        setButtonsVisible(false)
        setTimeout(() => setInputsVisible(false), 150)
        setTimeout(() => setConstellationVisible(false), 150)
        setTimeout(() => navigate(route), 700)
    }

    const fadeStyle = (visible) => ({
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: fadingOut ? 'none' : 'auto'
    })

    return (
        <div>
            {/* Constellation from Profile Page */}
            <div style={fadeStyle(constellationVisible)}>
                <ConstellationHeader constellation={constellation} />
            </div>
            
            {/* Input Elements | Changing Password */}
            <div style={{...fadeStyle(inputsVisible), width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4vh', gap: '20px'}}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <p style={{
                        color: 'white',
                        /* SMALL HEADING */
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '30px',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        lineHeight: 'normal',
                    }}>
                        change your email below:
                    </p>
                </div>

                {/* Verify Old Email */}
                <input style={{
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
                    lineHeight: 'normal',}}

                    type="text"
                    placeholder='enter current password correctly'
                >
                </input>

                {/* Enter New Email */}
                <input style={{
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
                    lineHeight: 'normal',}}

                    type="text"
                    placeholder='enter your new Email'
                >
                </input>

                {/* Verify New Email */}
                <input style={{
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
                    lineHeight: 'normal',}}

                    type="text"
                    placeholder='re-type new password to confirm changes'
                >
                </input>
            </div>

            {/* Save and Go Back Buttons */}
            <div style={{ ...fadeStyle(inputsVisible), width: '100%', display: 'flex', justifyContent: 'center', padding: '20px'}}>
                <div style={{paddingRight:'10px'}}>
                    {/* Save Button | NEED TO INTERGRATE SAVE FUNCTION TO BUTTON */}
                    <button
                        onClick={() => handleNavigation('/profile')}
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
                        }}
                    >
                        save
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
                    alignItems: 'center'
                    }}
                >
                    back
                </button>
            </div>
        </div>
    )
}

export default ChangeEmail

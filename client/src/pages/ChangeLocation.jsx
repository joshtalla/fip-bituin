import { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/auth-context'
import ProfileNavBar from '../components/ProfileNavBar'
import {
    APPROVED_LOCATIONS,
    getCurrentLocation,
    updateLocation,
} from '../services/profileService'

/**
 * ChangeLocation
 *
 * Profile sub-page where the authenticated user can update the location
 * stored on their profile row (users.country). Future posts and replies pick
 * up the new value automatically because the post/reply creation services
 * read users.country at write time.
 *
 * Behavior:
 *   - Fetches the user's current location on mount (loading state).
 *   - Pre-fills the dropdown with that value.
 *   - Validates that a value from APPROVED_LOCATIONS is chosen before save.
 *   - Disables the Save button while saving and while the value is unchanged.
 *   - Renders confirmation on success and an inline error banner on failure.
 *
 * Styling follows the same inline-style pattern as MyComments so the two
 * profile sub-pages feel visually consistent. The page is gated by
 * ProtectedRoute in AppRouter, so reaching this component implies an auth'd
 * user.
 */

const ChangeLocation = () => {
    const { user, loading: authLoading } = useContext(AuthContext)

    // Server-truth value used to detect changes vs. the dropdown selection.
    const [currentLocation, setCurrentLocation] = useState(null)
    const [selectedLocation, setSelectedLocation] = useState('')

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [saving, setSaving] = useState(false)
    const [validationError, setValidationError] = useState(null)
    const [saveError, setSaveError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    const dropdownRef = useRef(null)

    // Close the dropdown when the user clicks outside of it.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Initial fetch of the user's stored location.
    useEffect(() => {
        if (authLoading) return
        if (!user) {
            // ProtectedRoute redirects unauthenticated users, so this is a
            // transient state we can safely no-op.
            setLoadingProfile(false)
            return
        }

        let cancelled = false

        const loadLocation = async () => {
            setLoadingProfile(true)
            setSaveError(null)
            try {
                const location = await getCurrentLocation()
                if (cancelled) return
                setCurrentLocation(location)
                setSelectedLocation(location || '')
            } catch (loadError) {
                if (cancelled) return
                console.error('Failed to load current location:', loadError)
                setSaveError('Could not load your current location. Please refresh and try again.')
            } finally {
                if (!cancelled) {
                    setLoadingProfile(false)
                }
            }
        }

        loadLocation()
        return () => {
            cancelled = true
        }
    }, [user, authLoading])

    const isDirty = selectedLocation !== (currentLocation || '')
    const isSaveDisabled = saving || loadingProfile || !isDirty

    const handleSelectLocation = (location) => {
        setSelectedLocation(location)
        setDropdownOpen(false)
        // Clear any prior validation / error / success messages so the user
        // starts from a clean slate after each change.
        setValidationError(null)
        setSaveError(null)
        setSuccessMessage(null)
    }

    const handleSave = async () => {
        // Inline empty-submission validation per the AC's "block empty
        // submissions" + "inline validation message" requirements.
        if (!selectedLocation) {
            setValidationError('Please choose a location before saving.')
            return
        }
        if (!APPROVED_LOCATIONS.includes(selectedLocation)) {
            setValidationError('Please choose a location from the list.')
            return
        }

        setValidationError(null)
        setSaveError(null)
        setSuccessMessage(null)
        setSaving(true)

        try {
            const persisted = await updateLocation(selectedLocation)
            setCurrentLocation(persisted)
            setSelectedLocation(persisted)
            setSuccessMessage(`your location is now ${persisted}.`)
        } catch (saveErr) {
            console.error('Failed to update location:', saveErr)
            setSaveError(saveErr?.message || 'Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
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
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '40px 60px 60px 60px',
                }}
            >
                <ProfileNavBar />

                {/* Centered card with the change-location form. */}
                <div
                    style={{
                        margin: '48px auto 0',
                        maxWidth: '520px',
                        background: '#FBF3E5',
                        borderRadius: '20px',
                        padding: '32px 36px',
                        color: '#4C383A',
                        boxShadow: '0 20px 45px rgba(12,7,25,0.18)',
                    }}
                >
                    <h1
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '24px',
                            fontWeight: 600,
                            margin: 0,
                        }}
                    >
                        change your location
                    </h1>
                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            margin: '6px 0 0 0',
                            opacity: 0.75,
                        }}
                    >
                        this is shown alongside your future posts and replies.
                    </p>

                    {/* Loading state for the initial fetch. */}
                    {loadingProfile && (
                        <p
                            style={{
                                marginTop: '24px',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                opacity: 0.75,
                            }}
                        >
                            loading your current location...
                        </p>
                    )}

                    {!loadingProfile && (
                        <>
                            {/* Current value preview - helps the user see what
                                they had before changing it. */}
                            <div style={{ marginTop: '24px' }}>
                                <span
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '13px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        opacity: 0.65,
                                    }}
                                >
                                    current
                                </span>
                                <p
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '17px',
                                        fontWeight: 500,
                                        margin: '4px 0 0 0',
                                    }}
                                >
                                    {currentLocation || 'not set'}
                                </p>
                            </div>

                            {/* Dropdown */}
                            <div style={{ marginTop: '24px' }}>
                                <label
                                    htmlFor="change-location-trigger"
                                    style={{
                                        display: 'block',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '13px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        opacity: 0.65,
                                        marginBottom: '6px',
                                    }}
                                >
                                    new location
                                </label>

                                <div
                                    ref={dropdownRef}
                                    style={{ position: 'relative', width: '100%' }}
                                >
                                    <button
                                        id="change-location-trigger"
                                        type="button"
                                        onClick={() => setDropdownOpen((open) => !open)}
                                        aria-haspopup="listbox"
                                        aria-expanded={dropdownOpen}
                                        disabled={saving}
                                        style={{
                                            width: '100%',
                                            height: '44px',
                                            border: validationError
                                                ? '2px solid #C0473A'
                                                : '1px solid rgba(76,56,58,0.2)',
                                            borderRadius: '10px',
                                            background: '#DDD3C4',
                                            padding: '0 16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '15px',
                                            color: '#5a4747',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            opacity: saving ? 0.6 : 1,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontStyle: selectedLocation ? 'normal' : 'italic',
                                                opacity: selectedLocation ? 1 : 0.65,
                                            }}
                                        >
                                            {selectedLocation || 'choose location'}
                                        </span>
                                        <span style={{ fontSize: '18px' }}>
                                            {dropdownOpen ? '⌃' : '⌄'}
                                        </span>
                                    </button>

                                    {dropdownOpen && (
                                        <ul
                                            role="listbox"
                                            aria-label="Approved locations"
                                            style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 8px)',
                                                left: 0,
                                                right: 0,
                                                background: '#EFE8DC',
                                                borderRadius: '10px',
                                                boxShadow: '0 8px 18px rgba(0,0,0,0.14)',
                                                listStyle: 'none',
                                                margin: 0,
                                                padding: '8px 0',
                                                zIndex: 20,
                                            }}
                                        >
                                            {APPROVED_LOCATIONS.map((location) => {
                                                const isSelected = location === selectedLocation
                                                return (
                                                    <li key={location}>
                                                        <button
                                                            type="button"
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            onClick={() => handleSelectLocation(location)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px 18px',
                                                                border: 'none',
                                                                background: isSelected
                                                                    ? '#E9E0D3'
                                                                    : 'transparent',
                                                                textAlign: 'left',
                                                                fontFamily: 'Poppins, sans-serif',
                                                                fontSize: '15px',
                                                                color: '#5a4747',
                                                                fontWeight: isSelected ? 600 : 400,
                                                                cursor: 'pointer',
                                                            }}
                                                            onMouseEnter={(event) => {
                                                                event.currentTarget.style.background = '#E9E0D3'
                                                            }}
                                                            onMouseLeave={(event) => {
                                                                event.currentTarget.style.background = isSelected
                                                                    ? '#E9E0D3'
                                                                    : 'transparent'
                                                            }}
                                                        >
                                                            {location}
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </div>

                                {/* Inline validation message. */}
                                {validationError && (
                                    <p
                                        role="alert"
                                        style={{
                                            color: '#C0473A',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            margin: '8px 0 0 0',
                                        }}
                                    >
                                        {validationError}
                                    </p>
                                )}
                            </div>

                            {/* Success confirmation. */}
                            {successMessage && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    style={{
                                        marginTop: '20px',
                                        padding: '12px 16px',
                                        background: '#E2EDD9',
                                        border: '1px solid #8DA876',
                                        borderRadius: '10px',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '14px',
                                        color: '#3F5A2C',
                                    }}
                                >
                                    {successMessage}
                                </div>
                            )}

                            {/* Save error banner (network / supabase failure). */}
                            {saveError && (
                                <div
                                    role="alert"
                                    style={{
                                        marginTop: '20px',
                                        padding: '12px 16px',
                                        background: '#F8D7D2',
                                        border: '1px solid #C0473A',
                                        borderRadius: '10px',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '14px',
                                        color: '#7A1F14',
                                    }}
                                >
                                    {saveError}
                                </div>
                            )}

                            {/* Action row */}
                            <div
                                style={{
                                    marginTop: '28px',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaveDisabled}
                                    style={{
                                        fontFamily: 'Darumadrop One, sans-serif',
                                        fontSize: '20px',
                                        fontWeight: 400,
                                        color: '#4C383A',
                                        backgroundColor: isSaveDisabled
                                            ? 'rgba(239,183,88,0.55)'
                                            : '#EFB758',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '10px 28px',
                                        cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
                                        boxShadow: isSaveDisabled
                                            ? 'none'
                                            : '2px 2px 4px rgba(0,0,0,0.25)',
                                        transition: 'background-color 0.2s ease',
                                    }}
                                >
                                    {saving ? 'saving...' : 'save'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChangeLocation

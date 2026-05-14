import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * ProfileNavBar
 *
 * Horizontal "constellation strip" that sits above every profile sub-page
 * (my comments, my posts, saved posts, change location, etc.).
 *
 * Visual model (per Figma):
 *   - 7 constellation nodes laid out along a gently curved dashed arc.
 *   - Each node is a small SVG of white dots + connecting lines, with a label
 *     below it.
 *   - The constellation whose route matches the current pathname is "active":
 *     its dots glow cream/yellow and its label switches to bold yellow.
 *
 * The constellation shape data mirrors what Profile.jsx uses on the main
 * profile globe so the two views feel like the same map seen from a
 * different angle.
 */

// Route → constellation definition. Ordered left → right to match the Figma.
const NAV_CONSTELLATIONS = [
    {
        label: 'change location',
        route: '/profile/change-location',
        // Position along the arc, expressed as a percentage of the strip.
        x: '8%',
        y: '70%',
        dots: [{ cx: 40, cy: 30 }, { cx: 60, cy: 50 }, { cx: 80, cy: 40 }, { cx: 95, cy: 55 }, { cx: 70, cy: 75 }, { cx: 50, cy: 65 }],
        lines: [
            { x1: 40, y1: 30, x2: 60, y2: 50 },
            { x1: 60, y1: 50, x2: 80, y2: 40 },
            { x1: 80, y1: 40, x2: 95, y2: 55 },
            { x1: 60, y1: 50, x2: 50, y2: 65 },
            { x1: 50, y1: 65, x2: 70, y2: 75 },
            { x1: 70, y1: 75, x2: 80, y2: 40 },
        ],
    },
    {
        label: 'change language',
        route: '/profile/change-language',
        x: '22%',
        y: '50%',
        dots: [{ cx: 20, cy: 40 }, { cx: 45, cy: 25 }, { cx: 65, cy: 40 }, { cx: 55, cy: 65 }, { cx: 30, cy: 60 }, { cx: 80, cy: 65 }],
        lines: [
            { x1: 20, y1: 40, x2: 45, y2: 25 },
            { x1: 45, y1: 25, x2: 65, y2: 40 },
            { x1: 65, y1: 40, x2: 55, y2: 65 },
            { x1: 55, y1: 65, x2: 30, y2: 60 },
            { x1: 30, y1: 60, x2: 20, y2: 40 },
            { x1: 65, y1: 40, x2: 80, y2: 65 },
        ],
    },
    {
        label: 'change password',
        route: '/profile/change-password',
        x: '36%',
        y: '32%',
        dots: [{ cx: 20, cy: 75 }, { cx: 45, cy: 65 }, { cx: 70, cy: 50 }, { cx: 95, cy: 35 }, { cx: 60, cy: 80 }, { cx: 75, cy: 95 }],
        lines: [
            { x1: 20, y1: 75, x2: 45, y2: 65 },
            { x1: 45, y1: 65, x2: 70, y2: 50 },
            { x1: 70, y1: 50, x2: 95, y2: 35 },
            { x1: 70, y1: 50, x2: 60, y2: 80 },
            { x1: 60, y1: 80, x2: 75, y2: 95 },
        ],
    },
    {
        label: 'my comments',
        route: '/profile/my-comments',
        x: '50%',
        y: '22%',
        dots: [{ cx: 35, cy: 45 }, { cx: 65, cy: 40 }, { cx: 80, cy: 65 }, { cx: 45, cy: 70 }, { cx: 95, cy: 85 }, { cx: 35, cy: 90 }],
        lines: [
            { x1: 35, y1: 45, x2: 65, y2: 40 },
            { x1: 65, y1: 40, x2: 80, y2: 65 },
            { x1: 80, y1: 65, x2: 45, y2: 70 },
            { x1: 45, y1: 70, x2: 35, y2: 45 },
            { x1: 80, y1: 65, x2: 95, y2: 85 },
            { x1: 45, y1: 70, x2: 35, y2: 90 },
        ],
    },
    {
        label: 'my posts',
        route: '/profile/my-posts',
        x: '64%',
        y: '32%',
        dots: [{ cx: 75, cy: 15 }, { cx: 95, cy: 35 }, { cx: 105, cy: 60 }, { cx: 95, cy: 85 }, { cx: 70, cy: 70 }, { cx: 55, cy: 85 }, { cx: 45, cy: 65 }],
        lines: [
            { x1: 75, y1: 15, x2: 95, y2: 35 },
            { x1: 95, y1: 35, x2: 105, y2: 60 },
            { x1: 105, y1: 60, x2: 95, y2: 85 },
            { x1: 105, y1: 60, x2: 70, y2: 70 },
            { x1: 70, y1: 70, x2: 55, y2: 85 },
            { x1: 70, y1: 70, x2: 45, y2: 65 },
        ],
    },
    {
        label: 'saved posts',
        route: '/profile/saved-posts',
        x: '78%',
        y: '50%',
        dots: [{ cx: 40, cy: 30 }, { cx: 60, cy: 50 }, { cx: 80, cy: 40 }, { cx: 95, cy: 55 }, { cx: 70, cy: 75 }, { cx: 50, cy: 65 }],
        lines: [
            { x1: 40, y1: 30, x2: 60, y2: 50 },
            { x1: 60, y1: 50, x2: 80, y2: 40 },
            { x1: 80, y1: 40, x2: 95, y2: 55 },
            { x1: 60, y1: 50, x2: 50, y2: 65 },
            { x1: 50, y1: 65, x2: 70, y2: 75 },
            { x1: 70, y1: 75, x2: 80, y2: 40 },
        ],
    },
    {
        label: 'change email',
        route: '/profile/change-email',
        x: '92%',
        y: '70%',
        dots: [{ cx: 40, cy: 40 }, { cx: 65, cy: 30 }, { cx: 85, cy: 45 }, { cx: 95, cy: 70 }, { cx: 70, cy: 90 }, { cx: 45, cy: 80 }, { cx: 25, cy: 65 }],
        lines: [
            { x1: 40, y1: 40, x2: 65, y2: 30 },
            { x1: 65, y1: 30, x2: 85, y2: 45 },
            { x1: 85, y1: 45, x2: 95, y2: 70 },
            { x1: 95, y1: 70, x2: 70, y2: 90 },
            { x1: 70, y1: 90, x2: 45, y2: 80 },
            { x1: 45, y1: 80, x2: 25, y2: 65 },
            { x1: 25, y1: 65, x2: 40, y2: 40 },
        ],
    },
]

const ConstellationButton = ({ constellation, isActive, onClick }) => {
    const [hovered, setHovered] = useState(false)
    const { x, y, label, dots, lines } = constellation

    // Active constellations show the dots in a warm cream/yellow so the user
    // can read off where they are without reading the labels.
    const dotFill = isActive ? '#FFE9B7' : '#FFFFFF'
    const lineStroke = isActive ? '#FFE9B7' : '#FFFFFF'
    const lineOpacity = isActive ? 0.95 : 0.55
    const labelColor = isActive ? '#EFB758' : '#FFFFFF'
    const labelWeight = isActive ? 700 : 400

    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-current={isActive ? 'page' : undefined}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'center',
                filter: hovered && !isActive
                    ? 'brightness(1.6) drop-shadow(0 0 4px rgba(255,255,255,0.4))'
                    : isActive
                        ? 'drop-shadow(0 0 8px rgba(239,183,88,0.55))'
                        : 'brightness(1)',
                transition: 'filter 0.2s ease',
            }}
        >
            <svg
                width="92"
                height="92"
                viewBox="0 0 120 120"
                style={{ display: 'block', margin: '0 auto' }}
                aria-hidden="true"
            >
                {lines.map((line, i) => (
                    <line
                        key={`line-${i}`}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={lineStroke}
                        strokeWidth="1"
                        strokeOpacity={lineOpacity}
                    />
                ))}
                {dots.map((dot, i) => (
                    <circle
                        key={`dot-${i}`}
                        cx={dot.cx}
                        cy={dot.cy}
                        r={isActive ? 4 : 3}
                        fill={dotFill}
                    />
                ))}
            </svg>
            <span
                style={{
                    display: 'block',
                    marginTop: '4px',
                    color: labelColor,
                    fontSize: '13px',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: labelWeight,
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
            </span>
        </button>
    )
}

const ProfileNavBar = () => {
    const { pathname } = useLocation()
    const navigate = useNavigate()

    return (
        <nav
            aria-label="Profile sections"
            style={{
                position: 'relative',
                width: '100%',
                height: '240px',
                marginTop: '24px',
            }}
        >
            {/* Dashed arc connecting the constellations - decorative only. */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 1000 240"
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                }}
                aria-hidden="true"
            >
                <path
                    d="M 80 180 Q 500 0 920 180"
                    fill="none"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                />
            </svg>

            {NAV_CONSTELLATIONS.map((constellation) => (
                <ConstellationButton
                    key={constellation.route}
                    constellation={constellation}
                    isActive={pathname === constellation.route}
                    onClick={() => navigate(constellation.route)}
                />
            ))}
        </nav>
    )
}

export default ProfileNavBar

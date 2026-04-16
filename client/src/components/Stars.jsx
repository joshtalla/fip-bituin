import {useEffect, useRef} from 'react';

const Stars = ({ count = 100000 }) => {
    const canvasRef = useRef(null);
    useEffect(() =>{
        const siteBody = canvasRef.current;
        const ctx = siteBody.getContext('2d');
        siteBody.width = window.innerWidth;
        siteBody.height = window.innerHeight;

        for (let i = 0; i < count; i++){
            const xPlane = Math.random() * siteBody.width;
            const yPlane = Math.random() * siteBody.height;
            const radius = Math.random() * 0.7; // Star Sizes
            const opacity = Math.random() * 0.3 + 0.2;

            ctx.beginPath();
            ctx.arc(xPlane, yPlane, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255, ${opacity})`;
            ctx.fill();
        }

    }, []);
    return(
        <canvas
            ref={canvasRef}
            style={
                {position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
};

export default Stars;

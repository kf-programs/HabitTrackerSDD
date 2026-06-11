import React, { useMemo } from 'react';

// Define a 'safe' palette of soft, calming, translucent colors
const PALETTE = [
  'hsla(260, 80%, 80%, 0.4)', // Lavendar
  'hsla(160, 70%, 75%, 0.4)', // Mint Green
  'hsla(20, 90%, 85%, 0.4)',  // Pale Peach
  'hsla(200, 85%, 80%, 0.4)', // Soft Blue
  'hsla(50, 90%, 80%, 0.35)', // Buttery Yellow
];

// Configuration for the background effect
const CONFIG = {
  SPOT_COUNT: 7, // How many light spots to render
  SIZE_MIN: 15,  // Minimum spot size (as vw/vh)
  SIZE_MAX: 30,  // Maximum spot size
  DURATION_MIN: 25, // Minimum animation duration (seconds)
  DURATION_MAX: 60, // Maximum animation duration
};

// Generates randomized parameters for each spot on component mount
function generateSpots() {
  return Array.from({ length: CONFIG.SPOT_COUNT }).map((_, i) => ({
    id: i,
    // Size (dynamic based on viewport width)
    size: `${Math.random() * (CONFIG.SIZE_MAX - CONFIG.SIZE_MIN) + CONFIG.SIZE_MIN}vw`,
    color: PALETTE[i % PALETTE.length], // Rotate through palette
    // Initial Position (0-100%)
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    // Randomized animation details
    duration: `${Math.random() * (CONFIG.DURATION_MAX - CONFIG.DURATION_MIN) + CONFIG.DURATION_MIN}s`,
    delay: `-${Math.random() * CONFIG.DURATION_MAX}s`, // Negative delay for variety
  }));
}

export function CalmingBackground() {
  // Use useMemo so the randomized setup only happens ONCE, on component mount
  const spots = useMemo(() => generateSpots(), []);

  return (
    <>
      {/* 1. Global CSS for the drift animation. Define once in the app or here via <style> */}
      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(15vw, 15vh) scale(1.1) rotate(5deg); }
          50% { transform: translate(-10vw, 30vh) scale(1) rotate(-5deg); }
          75% { transform: translate(20vw, -10vh) scale(0.9) rotate(5deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
      `}</style>

      {/* 2. Fixed, full-screen container. This is the dark background layer. */}
      <div 
        className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950" 
        style={{ perspective: '1000px' }} // Adds subtle depth perception
      >
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="absolute rounded-full"
            style={{
              // Set the dynamic size
              width: spot.size,
              height: spot.size,
              // Initial random placement
              left: spot.x,
              top: spot.y,
              // 3. Create the light spot using a radial gradient (color to transparent)
              background: `radial-gradient(circle at center, ${spot.color} 0%, rgba(0,0,0,0) 70%)`,
              // 4. Extreme softening via blur. This creates the bokeh effect.
              filter: 'blur(100px)', // Custom blur for full-screen softness
              backdropFilter: 'blur(20px)', // Adds complexity
              // 5. Connect the randomized animation
              animationName: 'drift',
              animationDuration: spot.duration,
              animationDelay: spot.delay,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    </>
  );
}
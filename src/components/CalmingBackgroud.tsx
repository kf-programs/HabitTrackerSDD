import React, { useState } from 'react';

// Deeper, richer mid-tones that won't wash out when blurred
const WAVE_GRADIENTS = [
  'linear-gradient(90deg, rgba(180,150,255,0.8) 0%, rgba(255,160,180,0.8) 50%, rgba(255,190,140,0.8) 100%)', // Deep Lavender, Dusty Rose, Warm Peach
  'linear-gradient(90deg, rgba(130,220,190,0.8) 0%, rgba(140,190,255,0.8) 50%, rgba(180,170,255,0.8) 100%)', // Rich Seafoam, Cornflower Blue, Periwinkle
  'linear-gradient(90deg, rgba(255,190,140,0.8) 0%, rgba(255,150,190,0.8) 50%, rgba(190,160,255,0.8) 100%)', // Warm Peach, Pink Blush, Deep Lilac
  'linear-gradient(90deg, rgba(140,230,255,0.8) 0%, rgba(160,180,255,0.8) 50%, rgba(220,160,255,0.8) 100%)', // Sky Blue, Steel Blue, Orchid
  'linear-gradient(90deg, rgba(255,230,150,0.8) 0%, rgba(170,230,160,0.8) 50%, rgba(140,240,220,0.8) 100%)', // Muted Lemon, Sage Green, Bright Teal
];

export function CalmingBackground() {
  const [primaryIndex, setPrimaryIndex] = useState(() => 
    Math.floor(Math.random() * WAVE_GRADIENTS.length)
  );
  
  // A secondary index to ensure the overlapping wave is a different color
  const [secondaryIndex, setSecondaryIndex] = useState(() => 
    (Math.floor(Math.random() * WAVE_GRADIENTS.length) + 1) % WAVE_GRADIENTS.length
  );

  const handleNextPrimaryCycle = () => {
    setPrimaryIndex((prev) => {
      let next = Math.floor(Math.random() * WAVE_GRADIENTS.length);
      while (next === prev) next = Math.floor(Math.random() * WAVE_GRADIENTS.length);
      return next;
    });
  };

  const handleNextSecondaryCycle = () => {
    setSecondaryIndex((prev) => {
      let next = Math.floor(Math.random() * WAVE_GRADIENTS.length);
      while (next === prev) next = Math.floor(Math.random() * WAVE_GRADIENTS.length);
      return next;
    });
  };

  return (
    <>
      <style>{`
        @keyframes waveOne {
          0% { transform: translate(-100%, -50%) rotate(-35deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(120vw, 120vh) rotate(-35deg); opacity: 0; }
        }
        
        @keyframes waveTwo {
          0% { transform: translate(100vw, -100%) rotate(45deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translate(-50vw, 150vh) rotate(45deg); opacity: 0; }
        }
      `}</style>

      {/* slightly darkened the base canvas to #f4f3ed so the multiply effect bites harder */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#f4f3ed]">
        <div className="absolute inset-0 bg-gradient-to-tr from-stone-200/40 via-transparent to-zinc-200/30" />

        {/* Primary Wave */}
        <div
          className="absolute top-0 left-0 h-[60vh] w-[150vw] origin-top-left pointer-events-none mix-blend-multiply"
          onAnimationIteration={handleNextPrimaryCycle}
          style={{
            background: WAVE_GRADIENTS[primaryIndex],
            filter: 'blur(120px)',
            animation: 'waveOne 24s ease-in-out infinite',
          }}
        />

        {/* Secondary Counter-Wave */}
        <div
          className="absolute top-0 right-0 h-[70vh] w-[160vw] origin-top-right pointer-events-none mix-blend-multiply"
          onAnimationIteration={handleNextSecondaryCycle}
          style={{
            background: WAVE_GRADIENTS[secondaryIndex],
            filter: 'blur(140px)',
            animation: 'waveTwo 32s ease-in-out infinite',
            animationDelay: '-10s', /* Starts the second wave mid-cycle so the screen is never empty */
          }}
        />
      </div>
    </>
  );
}

import React from 'react';

const TopWave = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -z-[1]">
    <svg
      viewBox="0 0 1440 220" // Reduced height to make it more of a header wave
      xmlns="http://www.w3.org/2000/svg"
      className="relative block w-full h-[120px] sm:h-[150px] md:h-[180px]"
    >
      <path
        fill="hsl(var(--primary))" // Use theme's primary color
        fillOpacity="1"
        // A simpler, smoother wave path
        d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      ></path>
    </svg>
  </div>
);

export default TopWave;

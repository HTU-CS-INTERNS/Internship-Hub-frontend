import React from 'react';
import { cn } from '@/lib/utils';

const TopWave = () => (
  <div
    className={cn(
      "absolute top-0 left-0 w-full overflow-hidden leading-none -z-[1]",
      // Using a fixed height for testing, can be made responsive later
      "h-[180px] sm:h-[200px] md:h-[220px]" 
    )}
    aria-hidden="true"
  >
    <svg
      width="100%"
      height="100%" // Fill the div
      viewBox="0 0 1440 200" // Simplified viewBox for a rectangle
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative block"
    >
      {/* Simple rectangle using accent color for high visibility test */}
      <rect width="1440" height="200" fill="hsl(var(--accent))" />
    </svg>
  </div>
);

export default TopWave;

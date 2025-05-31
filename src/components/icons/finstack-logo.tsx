import React from 'react';

export function FinStackLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50,5 A45,45 0 1,0 50,95 A35,35 0 1,1 50,5 Z"
        fill="hsl(var(--primary))" // Vibrant Blue for crescent
      />
      <text
        x="52" // Slightly offset to the right for F, adjust as needed for visual balance
        y="51" // Adjusted y slightly for visual centering
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="42" // Adjusted font size for better fit and prominence
        fontWeight="bold"
        fill="hsl(var(--accent))" // Lighter blue (theme's accent color) for F
        fontFamily="var(--font-lato), sans-serif"
      >
        F
      </text>
    </svg>
  );
}


import React from 'react';

export function FinStackLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="5 5 45 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Half-circle (D-shape, flat side on the right, curved on the left) */}
      <path
        d="M50,5 A45,45 0 0,0 50,95 L50,5 Z"
        fill="hsl(var(--primary))"
      />
      {/* Letter F */}
      <text
        x="32" 
        y="51" 
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="40" 
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))" 
        fontFamily="var(--font-lato), sans-serif"
      >
        F
      </text>
    </svg>
  );
}

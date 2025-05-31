
import React from 'react';

export function FinStackLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="5 5 45 90" // D-shape from x=5 to x=50 (width 45), y=5 to y=95 (height 90)
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Half-circle (D-shape, flat side on the right, curved on the left) */}
      <path
        d="M50,5 A45,45 0 0,0 50,95 L50,5 Z" // Flat side at x=50, curve extends to x=5
        fill="hsl(var(--primary))"
      />
      {/* Letter F */}
      <text
        x="27.5" // Horizontal center of the D-shape (5 + 45/2)
        y="50"   // Vertical center of the D-shape (5 + 90/2)
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="67" // Adjusted to make "F" visually match 24px "inStack" text
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))" 
        fontFamily="var(--font-lato), sans-serif"
      >
        F
      </text>
    </svg>
  );
}

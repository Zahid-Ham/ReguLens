import React from 'react'

export default function BrandMark({ showTagline = true, size = 'default', as = 'div', href }) {
  const Component = href ? 'a' : as

  return (
    <Component href={href} className="flex items-center gap-3.5 group select-none">
      {/* Precision Geometric Leaf-Lens Emblem */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg
          className={size === 'large' ? 'w-10 h-10' : 'w-8 h-8'}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Stem */}
          <path
            d="M18 4V32"
            stroke="#132E22"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Left Leaf Blades / NLP Lens Facets */}
          <path
            d="M18 9C13.5 9 9.5 12 8 16.5C10 16 14 15 18 16"
            stroke="#132E22"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 16C12.5 16 8 19.5 6 24.5C9 23.5 14 22 18 23"
            stroke="#132E22"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 23C14 23 10 26 8.5 30C11.5 29 15 28 18 28.5"
            stroke="#132E22"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Leaf Blades / Regulatory Alignment Facets */}
          <path
            d="M18 6.5C22.5 6.5 26.5 9.5 28 14C26 13.5 22 12.5 18 13.5"
            stroke="#285C45"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 13.5C23.5 13.5 28 17 30 22C27 21 22 19.5 18 20.5"
            stroke="#285C45"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 20.5C22 20.5 26 23.5 27.5 27.5C24.5 26.5 21 25.5 18 26"
            stroke="#285C45"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className="text-[22px] font-bold tracking-[-0.03em] text-[#112117] leading-tight font-sans">
          Regu<span className="text-[#2C634D] font-semibold">Lens</span>
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-[-0.01em] text-[#55665C] font-normal -mt-0.5 whitespace-nowrap">
            Understand Regulations. Accelerate Compliance.
          </span>
        )}
      </div>
    </Component>
  )
}

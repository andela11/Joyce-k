import React from 'react';

interface JoyceKLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'dark-bg' | 'light-bg';
  showTagline?: boolean;
  className?: string;
}

export const JoyceKLogo: React.FC<JoyceKLogoProps> = ({
  size = 'md',
  variant = 'dark-bg',
  showTagline = false,
  className = '',
}) => {
  // Proportions for the stylized inline 'K' SVG glyph
  const sizeMap = {
    sm: {
      fontSize: 'text-lg',
      kWidth: 16,
      kHeight: 20,
      taglineSize: 'text-[9px]',
    },
    md: {
      fontSize: 'text-2xl',
      kWidth: 20,
      kHeight: 24,
      taglineSize: 'text-[10px]',
    },
    lg: {
      fontSize: 'text-3xl sm:text-4xl',
      kWidth: 26,
      kHeight: 32,
      taglineSize: 'text-xs',
    },
    xl: {
      fontSize: 'text-4xl sm:text-5xl',
      kWidth: 34,
      kHeight: 42,
      taglineSize: 'text-sm',
    },
  };

  const currentSize = sizeMap[size];
  const isDarkBg = variant === 'dark' || variant === 'dark-bg';
  const textColor = isDarkBg ? 'text-white' : 'text-slate-900';
  const spineColor = isDarkBg ? '#FFFFFF' : '#0F172A';
  const softRed = '#F43F5E'; // Soft refined rose/red

  return (
    <div className={`inline-flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className={`flex items-center justify-center font-black tracking-tight leading-none ${currentSize.fontSize} font-sans text-center`}>
        {/* "Joyce-" */}
        <span className={`${textColor} drop-shadow-xs transition-colors`}>
          Joyce-
        </span>

        {/* The custom stylized "K" glyph directly following "Joyce-" */}
        <span className="inline-flex items-center justify-center ml-0.5 transform translate-y-[1px]">
          <svg
            width={currentSize.kWidth}
            height={currentSize.kHeight}
            viewBox="0 0 24 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block overflow-visible"
          >
            {/* Vertical spine of K */}
            <path
              d="M5 3V25"
              stroke={spineColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Upper inclined stroke of K - SOFT RED */}
            <path
              d="M5 14L20 3"
              stroke={softRed}
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            {/* Lower inclined branch of K */}
            <path
              d="M5 14L20 25"
              stroke={spineColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>

      {showTagline && (
        <span
          className={`${currentSize.taglineSize} uppercase font-bold tracking-widest text-rose-500/95 mt-1.5 font-sans text-center block w-full`}
        >
          Rencontres Authentiques
        </span>
      )}
    </div>
  );
};

/**
 * Design System Tokens for Home Service App
 * 
 * This file documents the design system and provides standardized values
 * for consistent use across the application.
 */

export const designTokens = {
  // =====================================
  // HOMECARE BRAND IDENTITY
  // =====================================
  brand: {
    name: 'HomeCare Services',
    tagline: 'Your trusted home service partner',
    personality: ['Professional', 'Trustworthy', 'Reliable', 'Modern', 'Caring'],
    voice: {
      tone: 'Friendly yet professional',
      style: 'Clear, helpful, and reassuring',
      guidelines: [
        'Use warm, welcoming language',
        'Be specific and actionable', 
        'Emphasize trust and reliability',
        'Keep technical jargon minimal'
      ]
    }
  },

  // =====================================
  // ENHANCED COLOR SYSTEM (HomeCare Brand)
  // =====================================
  colors: {
    // Primary Brand - Trust Blue (Professional home services)
    primary: {
      light: 'bg-primary-50 text-primary-700',
      default: 'bg-primary-600 text-white',
      dark: 'bg-primary-700 text-white',
      surface: 'bg-primary-50 border-primary-200',
      border: 'border-primary-200',
      text: 'text-primary-600',
      textLight: 'text-primary-500',
      // New: Brand-specific variants
      gradient: 'bg-gradient-to-r from-primary-500 to-primary-600',
      hero: 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800',
      subtle: 'bg-primary-50/50',
    },
    
    // Secondary - Warm Orange (Energy & Action)
    secondary: {
      light: 'bg-secondary-50 text-secondary-700',
      default: 'bg-secondary-500 text-white',
      dark: 'bg-secondary-600 text-white',
      surface: 'bg-secondary-50 border-secondary-200',
      border: 'border-secondary-200',
      text: 'text-secondary-600',
      // New: Brand-specific variants
      gradient: 'bg-gradient-to-r from-secondary-400 to-secondary-500',
      accent: 'bg-gradient-to-r from-secondary-500 to-warning-500',
    },
    
    // Semantic Colors
    success: {
      light: 'bg-success-50 text-success-700',
      default: 'bg-success-600 text-white',
      surface: 'bg-success-50 border-success-200',
      text: 'text-success-600',
    },
    
    warning: {
      light: 'bg-warning-50 text-warning-700',
      default: 'bg-warning-500 text-white',
      surface: 'bg-warning-50 border-warning-200',
      text: 'text-warning-600',
    },
    
    error: {
      light: 'bg-error-50 text-error-700',
      default: 'bg-error-600 text-white',
      surface: 'bg-error-50 border-error-200',
      text: 'text-error-600',
    },
    
    // Neutral Scale
    neutral: {
      white: 'bg-white text-neutral-900',
      surface: 'bg-neutral-50 text-neutral-900',
      muted: 'bg-neutral-100 text-neutral-700',
      border: 'border-neutral-200',
      text: 'text-neutral-700',
      textMuted: 'text-neutral-500',
      textLight: 'text-neutral-400',
    },
  },

  // =====================================
  // TYPOGRAPHY SYSTEM (Enhanced Hierarchy)
  // =====================================
  typography: {
    // Display (Hero/Landing sections) - Extra bold for impact
    display: {
      large: 'text-5xl md:text-6xl font-black font-display leading-none tracking-tight',
      medium: 'text-4xl md:text-5xl font-black font-display leading-none tracking-tight', 
      small: 'text-3xl md:text-4xl font-black font-display leading-tight tracking-tight',
    },
    
    // Headings - Strong hierarchy with varied weights
    heading: {
      h1: 'text-3xl font-bold leading-tight tracking-tight text-neutral-900',
      h2: 'text-2xl font-bold leading-tight tracking-tight text-neutral-900',
      h3: 'text-xl font-semibold leading-snug text-neutral-900',
      h4: 'text-lg font-semibold leading-snug text-neutral-800',
      h5: 'text-base font-medium leading-normal text-neutral-800',
      h6: 'text-sm font-medium leading-normal text-neutral-700',
    },
    
    // Body text - Improved readability and contrast
    body: {
      large: 'text-lg leading-relaxed text-neutral-700 font-normal',
      default: 'text-base leading-relaxed text-neutral-600 font-normal',
      small: 'text-sm leading-normal text-neutral-600 font-normal',
      tiny: 'text-xs leading-normal text-neutral-500 font-normal',
    },
    
    // Special text with enhanced styling
    caption: 'text-xs text-neutral-500 leading-normal font-medium uppercase tracking-wide',
    overline: 'text-xs font-semibold uppercase tracking-widest leading-normal text-neutral-400',
    code: 'font-mono text-sm bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md border',
    
    // New: Enhanced contrast pairings
    contrast: {
      title: 'text-neutral-900 font-bold',
      subtitle: 'text-neutral-600 font-medium',
      description: 'text-neutral-500 font-normal',
      accent: 'text-primary-600 font-semibold',
    },
    
    // New: Semantic text styles
    semantic: {
      success: 'text-success-700 font-medium',
      warning: 'text-warning-700 font-medium', 
      error: 'text-error-700 font-medium',
      info: 'text-primary-700 font-medium',
    },
  },

  // =====================================
  // SPACING SYSTEM (4px base)
  // =====================================
  spacing: {
    // Component spacing
    xs: 'p-2',      // 8px
    sm: 'p-3',      // 12px
    md: 'p-4',      // 16px
    lg: 'p-6',      // 24px
    xl: 'p-8',      // 32px
    '2xl': 'p-12',  // 48px
    
    // Margin utilities
    margin: {
      xs: 'mb-2',   // 8px
      sm: 'mb-3',   // 12px
      md: 'mb-4',   // 16px
      lg: 'mb-6',   // 24px
      xl: 'mb-8',   // 32px
    },
    
    // Gap utilities
    gap: {
      xs: 'gap-2',  // 8px
      sm: 'gap-3',  // 12px
      md: 'gap-4',  // 16px
      lg: 'gap-6',  // 24px
      xl: 'gap-8',  // 32px
    },
  },

  // =====================================
  // BORDER RADIUS SYSTEM
  // =====================================
  radius: {
    none: 'rounded-none',     // 0px
    small: 'rounded-sm',      // 4px
    default: 'rounded-md',    // 8px
    large: 'rounded-lg',      // 12px
    xl: 'rounded-xl',         // 16px
    '2xl': 'rounded-2xl',     // 24px
    '3xl': 'rounded-3xl',     // 32px
    full: 'rounded-full',     // 9999px
  },

  // =====================================
  // SHADOW SYSTEM
  // =====================================
  shadows: {
    none: 'shadow-none',
    subtle: 'shadow-xs',
    small: 'shadow-sm',
    default: 'shadow-md',
    large: 'shadow-lg',
    xl: 'shadow-xl',
    
    // Semantic shadows
    card: 'shadow-card hover:shadow-card-hover',
    elevated: 'shadow-elevated',
    focus: 'focus:shadow-lg focus:shadow-primary-200/50',
  },

  // =====================================
  // VISUAL ELEMENTS & GRADIENTS
  // =====================================
  gradients: {
    // Hero backgrounds
    hero: 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800',
    heroSoft: 'bg-gradient-to-br from-primary-50 via-white to-neutral-50',
    
    // Card backgrounds
    cardSubtle: 'bg-gradient-to-br from-white to-neutral-50',
    cardElevated: 'bg-gradient-to-br from-white via-white to-primary-50/30',
    
    // Feature highlights
    feature: 'bg-gradient-to-r from-primary-500 to-secondary-500',
    success: 'bg-gradient-to-r from-success-500 to-success-600',
    warning: 'bg-gradient-to-r from-warning-500 to-secondary-500',
    
    // Overlays
    overlay: 'bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent',
    overlayLight: 'bg-gradient-to-t from-white/90 to-transparent',
  },

  // =====================================
  // ENHANCED SPACING (Visual Breathing Room)
  // =====================================
  spacing: {
    // Component spacing (4px base system)
    xs: 'p-2',      // 8px
    sm: 'p-3',      // 12px
    md: 'p-4',      // 16px
    lg: 'p-6',      // 24px
    xl: 'p-8',      // 32px
    '2xl': 'p-12',  // 48px
    '3xl': 'p-16',  // 64px - New for hero sections
    
    // Section spacing (Enhanced hierarchy)
    section: {
      xs: 'py-8',    // 32px
      sm: 'py-12',   // 48px
      md: 'py-16',   // 64px
      lg: 'py-20',   // 80px
      xl: 'py-24',   // 96px
      hero: 'py-32', // 128px - For landing sections
    },
    
    // Content spacing
    content: {
      tight: 'space-y-2',     // 8px
      normal: 'space-y-4',    // 16px
      relaxed: 'space-y-6',   // 24px
      loose: 'space-y-8',     // 32px
      spacious: 'space-y-12', // 48px
    },
    
    // Margin utilities
    margin: {
      xs: 'mb-2',   // 8px
      sm: 'mb-3',   // 12px
      md: 'mb-4',   // 16px
      lg: 'mb-6',   // 24px
      xl: 'mb-8',   // 32px
      '2xl': 'mb-12', // 48px
    },
    
    // Gap utilities
    gap: {
      xs: 'gap-2',  // 8px
      sm: 'gap-3',  // 12px
      md: 'gap-4',  // 16px
      lg: 'gap-6',  // 24px
      xl: 'gap-8',  // 32px
      '2xl': 'gap-12', // 48px
    },
  },

  // =====================================
  // ANIMATION SYSTEM (Enhanced)
  // =====================================
  animations: {
    fade: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    scale: 'animate-scale-in',
    bounce: 'animate-bounce-soft',
    
    // Transitions (Enhanced timing)
    smooth: 'transition-all duration-200 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    slow: 'transition-all duration-200 ease-in-out',
    slower: 'transition-all duration-250 ease-in-out',
    
    // Hover effects
    hover: {
      scale: 'hover:scale-105 transition-transform duration-200',
      lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
      glow: 'hover:shadow-lg hover:shadow-primary-200/50 transition-all duration-200',
    },
  },

  // =====================================
  // ENHANCED COMPONENT PATTERNS (Brand Identity)
  // =====================================
  components: {
    // Card patterns (Enhanced visual hierarchy)
    card: {
          default: 'bg-white rounded-xl shadow-card border border-neutral-200 p-6 hover:shadow-card-hover transition-all duration-150',
    hover: 'bg-white rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 border border-neutral-200 p-6 transition-all duration-150',
      elevated: 'bg-gradient-to-br from-white via-white to-primary-50/30 rounded-xl shadow-elevated border border-neutral-100 p-6',
      feature: 'bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-lg border border-primary-200/50 p-6',
      hero: 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-xl text-white p-8',
    },
    
    // Button patterns (Enhanced with gradients)
    button: {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      secondary: 'bg-white hover:bg-neutral-50 text-neutral-700 font-medium px-4 py-2 rounded-lg border border-neutral-300 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      outline: 'bg-transparent hover:bg-primary-50 text-primary-600 font-semibold px-4 py-2 rounded-lg border-2 border-primary-300 hover:border-primary-400 transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 font-medium px-4 py-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200',
    },
    
    // Input patterns (Enhanced focus states)
    input: {
      default: 'w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 placeholder:text-neutral-400',
      error: 'w-full px-4 py-3 border border-error-300 rounded-lg bg-white focus:ring-2 focus:ring-error-500 focus:border-error-500 transition-all duration-200',
      success: 'w-full px-4 py-3 border border-success-300 rounded-lg bg-white focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-all duration-200',
    },
    
    // Badge patterns (Enhanced with better contrast)
    badge: {
      primary: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 border border-primary-200',
      success: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800 border border-success-200',
      warning: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-800 border border-warning-200',
      error: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-error-100 text-error-800 border border-error-200',
      neutral: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200',
      gradient: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white',
    },
    
    // New: Section patterns for better hierarchy
    section: {
      hero: 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 lg:py-32',
      feature: 'bg-gradient-to-br from-primary-50 via-white to-neutral-50 py-16 lg:py-24',
      content: 'bg-white py-12 lg:py-16',
      footer: 'bg-neutral-900 text-white py-12',
    },
  },
};

// =====================================
// USAGE GUIDELINES
// =====================================

/**
 * HOW TO USE THIS DESIGN SYSTEM:
 * 
 * 1. COLORS:
 *    - Use semantic colors for meaning (success, warning, error)
 *    - Use primary for brand actions, secondary for accents
 *    - Use neutral scale for text and backgrounds
 * 
 * 2. TYPOGRAPHY:
 *    - Use display for hero sections and major headings
 *    - Use heading hierarchy for content structure
 *    - Use body text for readable content
 * 
 * 3. SPACING:
 *    - Follow 4px base spacing system
 *    - Use consistent spacing tokens
 *    - Prefer larger spacing for better breathing room
 * 
 * 4. COMPONENTS:
 *    - Use predefined component patterns
 *    - Extend patterns rather than creating new ones
 *    - Maintain consistency across similar elements
 * 
 * 5. ANIMATIONS:
 *    - Use smooth transitions for interactions
 *    - Keep animations subtle and purposeful
 *    - Use consistent timing and easing
 */

export default designTokens; 
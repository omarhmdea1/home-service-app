/**
 * UI Components Library
 * 
 * Reusable components following the design system tokens
 */

import React from 'react';
import { motion } from 'framer-motion';
import { designTokens } from '../../styles/designTokens';

// =====================================
// BUTTON COMPONENTS
// =====================================

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className = '',
  icon,
  iconPosition = 'left',
  ...props 
}) => {
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  // ✅ FIX: Get variant from designTokens with fallback
  const getVariantClasses = (variant) => {
    const variantClass = designTokens.components.button[variant];
    if (!variantClass) {
      console.warn(`Button variant "${variant}" not found, using primary`);
      return designTokens.components.button.primary;
    }
    return variantClass;
  };

  // ✅ FIX: Safely replace sizing classes with proper error handling
  const baseClasses = (() => {
    const variantClasses = getVariantClasses(variant);
    const sizeClasses = sizes[size] || sizes.md;
    
    // Replace the default px-4 py-2 with the appropriate size
    return variantClasses.replace('px-4 py-2', sizeClasses);
  })();

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseClasses}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${loading ? 'cursor-wait' : ''}
        inline-flex items-center justify-center font-medium
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </motion.button>
  );
};

// =====================================
// CARD COMPONENTS
// =====================================

export const Card = ({ 
  children, 
  variant = 'default',
  hover = false,
  className = '',
  ...props 
}) => {
  const variants = {
    default: designTokens.components.card.default,
    hover: designTokens.components.card.hover,
    elevated: designTokens.components.card.elevated,
  };

  const cardClasses = hover ? variants.hover : variants[variant];

  return (
    <div className={`${cardClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`border-b border-neutral-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`${designTokens.typography.heading.h3} ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`border-t border-neutral-200 pt-4 mt-4 ${className}`} {...props}>
    {children}
  </div>
);

// =====================================
// BADGE COMPONENTS
// =====================================

export const Badge = ({ 
  children, 
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: designTokens.components.badge.primary,
    success: designTokens.components.badge.success,
    warning: designTokens.components.badge.warning,
    error: designTokens.components.badge.error,
    neutral: designTokens.components.badge.neutral,
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const baseClasses = variants[variant].replace('px-2.5 py-0.5 text-xs', sizes[size]);

  return (
    <span className={`${baseClasses} ${className}`} {...props}>
      {children}
    </span>
  );
};

// =====================================
// INPUT COMPONENTS
// =====================================

export const Input = ({ 
  label,
  error,
  helper,
  className = '',
  ...props 
}) => {
  const inputClasses = error 
    ? designTokens.components.input.error
    : designTokens.components.input.default;

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block ${designTokens.typography.body.small} font-medium text-neutral-700`}>
          {label}
        </label>
      )}
      <input 
        className={`${inputClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className={`${designTokens.typography.body.small} text-error-600`}>
          {error}
        </p>
      )}
      {helper && !error && (
        <p className={`${designTokens.typography.body.small} text-neutral-500`}>
          {helper}
        </p>
      )}
    </div>
  );
};

export const Textarea = ({ 
  label,
  error,
  helper,
  className = '',
  rows = 4,
  ...props 
}) => {
  const inputClasses = error 
    ? designTokens.components.input.error
    : designTokens.components.input.default;

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block ${designTokens.typography.body.small} font-medium text-neutral-700`}>
          {label}
        </label>
      )}
      <textarea 
        rows={rows}
        className={`${inputClasses} resize-none ${className}`}
        {...props}
      />
      {error && (
        <p className={`${designTokens.typography.body.small} text-error-600`}>
          {error}
        </p>
      )}
      {helper && !error && (
        <p className={`${designTokens.typography.body.small} text-neutral-500`}>
          {helper}
        </p>
      )}
    </div>
  );
};

// =====================================
// TYPOGRAPHY COMPONENTS
// =====================================

export const Display = ({ children, size = 'medium', className = '', ...props }) => {
  const sizes = {
    small: designTokens.typography.display.small,
    medium: designTokens.typography.display.medium,
    large: designTokens.typography.display.large,
  };

  return (
    <h1 className={`${sizes[size]} ${className}`} {...props}>
      {children}
    </h1>
  );
};

export const Heading = ({ children, level = 1, className = '', ...props }) => {
  const levels = {
    1: designTokens.typography.heading.h1,
    2: designTokens.typography.heading.h2,
    3: designTokens.typography.heading.h3,
    4: designTokens.typography.heading.h4,
    5: designTokens.typography.heading.h5,
    6: designTokens.typography.heading.h6,
  };

  const Component = `h${level}`;
  
  return React.createElement(
    Component,
    { className: `${levels[level]} ${className}`, ...props },
    children
  );
};

export const Text = ({ children, size = 'default', className = '', ...props }) => {
  const sizes = {
    large: designTokens.typography.body.large,
    default: designTokens.typography.body.default,
    small: designTokens.typography.body.small,
    tiny: designTokens.typography.body.tiny,
  };

  return (
    <p className={`${sizes[size]} ${className}`} {...props}>
      {children}
    </p>
  );
};

export const Caption = ({ children, className = '', ...props }) => (
  <span className={`${designTokens.typography.caption} ${className}`} {...props}>
    {children}
  </span>
);

// =====================================
// LAYOUT COMPONENTS
// =====================================

export const Container = ({ children, size = 'default', className = '', ...props }) => {
  const sizes = {
    sm: 'max-w-2xl',
    default: 'max-w-7xl',
    lg: 'max-w-8xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${sizes[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Stack = ({ children, spacing = 'md', direction = 'vertical', className = '', ...props }) => {
  const spacings = {
    xs: 'gap-2',
    sm: 'gap-3', 
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const directions = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
  };

  return (
    <div className={`${directions[direction]} ${spacings[spacing]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Grid = ({ children, cols = 1, gap = 'md', className = '', ...props }) => {
  const columns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  };

  const gaps = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4', 
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div className={`grid ${columns[cols]} ${gaps[gap]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// =====================================
// ALERT COMPONENTS  
// =====================================

export const Alert = ({ 
  children, 
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
  ...props 
}) => {
  const variants = {
    info: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-error-50 border-error-200 text-error-800',
  };

  const icons = {
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`rounded-lg border p-4 ${variants[variant]} ${className}`} {...props}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[variant]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className={title ? 'text-sm' : 'text-sm font-medium'}>
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================
// LOADING COMPONENTS
// =====================================

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <svg 
      className={`animate-spin ${sizes[size]} ${className}`} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const LoadingState = ({ title = 'Loading...', description, className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <Spinner size="lg" className="text-primary-600 mb-4" />
    <Heading level={3} className="text-neutral-900 mb-2">
      {title}
    </Heading>
    {description && (
      <Text className="text-neutral-600 text-center">
        {description}
      </Text>
    )}
  </div>
);

// =====================================
// EXPORTS
// =====================================

// Import additional components
export { default as ServiceCard } from './ServiceCard';
export { default as ActionCard } from './ActionCard';

// Icon system
export { default as Icon, Icons, getServiceIcon, getStatusIcon } from './Icon';

// Design tokens
export { designTokens } from '../../styles/designTokens';

// Form components
export {
  Form,
  FormField,
  FormSection,
  FormActions,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormSubmitButton,
} from './Form';

// Role-based components
export { default as RoleRestrictionAlert } from './RoleRestrictionAlert'; 
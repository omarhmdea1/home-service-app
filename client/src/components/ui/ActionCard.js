import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Text, Heading } from './index';

/**
 * Standardized Action Card Component for dashboard quick actions
 * 
 * @param {ReactNode} icon - Action icon
 * @param {string} title - Action title
 * @param {string} subtitle - Action description
 * @param {Function} onClick - Click handler
 * @param {string} variant - Style variant
 * @param {string} badge - Optional badge text
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional CSS classes
 */
const ActionCard = ({ 
  icon, 
  title, 
  subtitle, 
  onClick, 
  variant = 'default',
  badge,
  disabled = false,
  className = ''
}) => {
  const variants = {
    emergency: {
      background: 'bg-gradient-to-r from-error-50 to-error-100 border-error-200 hover:from-error-100 hover:to-error-200',
      iconColor: 'text-error-600',
      badgeVariant: 'error'
    },
    primary: {
      background: 'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200 hover:from-primary-100 hover:to-primary-200',
      iconColor: 'text-primary-600',
      badgeVariant: 'primary'
    },
    secondary: {
      background: 'bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200 hover:from-secondary-100 hover:to-secondary-200',
      iconColor: 'text-secondary-600',
      badgeVariant: 'warning'
    },
    success: {
      background: 'bg-gradient-to-r from-success-50 to-success-100 border-success-200 hover:from-success-100 hover:to-success-200',
      iconColor: 'text-success-600',
      badgeVariant: 'success'
    },
    default: {
      background: 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-card-hover',
      iconColor: 'text-neutral-600',
      badgeVariant: 'neutral'
    }
  };

  const config = variants[variant];

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={className}
    >
      <div
        onClick={disabled ? undefined : onClick}
        className={`
          p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 
          ${config.background} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          relative overflow-hidden group
        `}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-300"></div>
        
        <div className="relative z-10">
          <div className={`mb-3 ${config.iconColor} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          
          <Heading level={4} className="text-neutral-900 mb-1">
            {title}
          </Heading>
          
          <Text size="small" className="text-neutral-600">
            {subtitle}
          </Text>
          
          {badge && (
            <div className="mt-3">
              <Badge variant={config.badgeVariant} size="sm">
                {badge}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActionCard; 
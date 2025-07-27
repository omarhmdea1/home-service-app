import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stack, Heading, Text, Button, Badge } from '../ui';

/**
 * Breadcrumb Navigation Component
 */
const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm mb-2">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          
          {item.href ? (
            <Link 
              to={item.href} 
              className="text-neutral-500 hover:text-primary-600 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? 'text-neutral-900 font-medium' : 'text-neutral-500'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * Page Header Component
 * 
 * Provides consistent page titles, descriptions, actions, and navigation
 */
const PageHeader = ({
  title,
  subtitle,
  description,
  icon,
  badge,
  breadcrumbs = [],
  actions = [],
  primaryAction,
  backButton,
  className = '',
  ...props
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 lg:mb-8 ${className}`}
      {...props}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            {/* Back Button */}
            {backButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={backButton.onClick}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                title={backButton.label || 'Go back'}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </motion.button>
            )}

            {/* Icon */}
            {icon && (
              <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
                <div className="h-6 w-6 text-primary-600">
                  {icon}
                </div>
              </div>
            )}

            {/* Title and Badge */}
            <div className="flex items-center space-x-3">
              <Heading level={1} className="text-neutral-900">
                {title}
              </Heading>
              {badge && (
                <Badge variant={badge.variant || 'primary'}>
                  {badge.text}
                </Badge>
              )}
            </div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <Text size="large" className="text-neutral-600 mb-2">
              {subtitle}
            </Text>
          )}

          {/* Description */}
          {description && (
            <Text className="text-neutral-600 max-w-2xl">
              {description}
            </Text>
          )}
        </div>

        {/* Actions Section */}
        {(actions.length > 0 || primaryAction) && (
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-3">
              {/* Secondary Actions */}
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'secondary'}
                  size={action.size || 'md'}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  icon={action.icon}
                  className={action.className}
                >
                  {action.label}
                </Button>
              ))}

              {/* Primary Action */}
              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'primary'}
                  size={primaryAction.size || 'md'}
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  loading={primaryAction.loading}
                  icon={primaryAction.icon}
                  className={primaryAction.className}
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
};

export default PageHeader; 
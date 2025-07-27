import React from 'react';
import { motion } from 'framer-motion';
import { Stack, Grid, Card, LoadingState, Alert, Text, Heading } from '../ui';

/**
 * Content Section Component
 * 
 * Provides consistent spacing and styling for page sections
 */
export const ContentSection = ({
  children,
  title,
  subtitle,
  actions,
  spacing = 'lg',
  className = '',
  ...props
}) => {
  return (
    <Stack spacing={spacing} className={className} {...props}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <Heading level={2} className="text-neutral-900 mb-1">
                {title}
              </Heading>
            )}
            {subtitle && (
              <Text className="text-neutral-600">
                {subtitle}
              </Text>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </Stack>
  );
};

/**
 * Card Grid Layout Component
 * 
 * Responsive grid for cards with consistent spacing
 */
export const CardGrid = ({
  children,
  cols = 3,
  gap = 'lg',
  loading = false,
  empty = false,
  emptyTitle = 'No items found',
  emptyDescription = 'There are no items to display at the moment.',
  emptyAction,
  error,
  className = '',
  ...props
}) => {
  if (loading) {
    return (
      <LoadingState 
        title="Loading content..."
        description="Please wait while we fetch your data."
      />
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading content">
        {error.message || 'Something went wrong while loading the content.'}
      </Alert>
    );
  }

  if (empty) {
    return (
      <Card className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📋</div>
          <Heading level={3} className="text-neutral-900 mb-2">
            {emptyTitle}
          </Heading>
          <Text className="text-neutral-600 mb-6">
            {emptyDescription}
          </Text>
          {emptyAction}
        </div>
      </Card>
    );
  }

  return (
    <Grid cols={cols} gap={gap} className={className} {...props}>
      {children}
    </Grid>
  );
};

/**
 * List Layout Component
 * 
 * Vertical list with consistent spacing and dividers
 */
export const ListLayout = ({
  children,
  divided = true,
  spacing = 'md',
  loading = false,
  empty = false,
  emptyTitle = 'No items found',
  emptyDescription = 'There are no items to display at the moment.',
  emptyAction,
  error,
  className = '',
  ...props
}) => {
  if (loading) {
    return (
      <LoadingState 
        title="Loading items..."
        description="Please wait while we fetch your data."
      />
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading items">
        {error.message || 'Something went wrong while loading the items.'}
      </Alert>
    );
  }

  if (empty) {
    return (
      <Card className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📝</div>
          <Heading level={3} className="text-neutral-900 mb-2">
            {emptyTitle}
          </Heading>
          <Text className="text-neutral-600 mb-6">
            {emptyDescription}
          </Text>
          {emptyAction}
        </div>
      </Card>
    );
  }

  return (
    <Card className={className} {...props}>
      <Stack 
        spacing={spacing}
        className={divided ? 'divide-y divide-neutral-200' : ''}
      >
        {children}
      </Stack>
    </Card>
  );
};

/**
 * Detail Layout Component
 * 
 * Two-column layout for detail pages
 */
export const DetailLayout = ({
  main,
  sidebar,
  sidebarPosition = 'right',
  sidebarWidth = 'lg:w-80',
  className = '',
  ...props
}) => {
  const isLeftSidebar = sidebarPosition === 'left';
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 ${className}`} {...props}>
      {/* Sidebar - Left */}
      {isLeftSidebar && sidebar && (
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          {sidebar}
        </motion.aside>
      )}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`lg:col-span-${sidebar ? '3' : '4'}`}
      >
        {main}
      </motion.main>

      {/* Sidebar - Right */}
      {!isLeftSidebar && sidebar && (
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          {sidebar}
        </motion.aside>
      )}
    </div>
  );
};

/**
 * Stats Layout Component
 * 
 * Horizontal stats/metrics layout
 */
export const StatsLayout = ({
  children,
  cols = 4,
  gap = 'md',
  className = '',
  ...props
}) => {
  return (
    <Grid 
      cols={cols} 
      gap={gap} 
      className={`mb-6 lg:mb-8 ${className}`} 
      {...props}
    >
      {children}
    </Grid>
  );
};

/**
 * Dashboard Layout Component
 * 
 * Common dashboard layout with stats, quick actions, and main content
 */
export const DashboardLayout = ({
  stats,
  quickActions,
  mainContent,
  sidebar,
  className = '',
  ...props
}) => {
  return (
    <Stack spacing="xl" className={className} {...props}>
      {/* Stats Section */}
      {stats && (
        <ContentSection title="Overview">
          {stats}
        </ContentSection>
      )}

      {/* Quick Actions */}
      {quickActions && (
        <ContentSection title="Quick Actions">
          {quickActions}
        </ContentSection>
      )}

      {/* Main Content with Optional Sidebar */}
      {sidebar ? (
        <DetailLayout main={mainContent} sidebar={sidebar} />
      ) : (
        <ContentSection>
          {mainContent}
        </ContentSection>
      )}
    </Stack>
  );
};

export default {
  ContentSection,
  CardGrid,
  ListLayout,
  DetailLayout,
  StatsLayout,
  DashboardLayout,
}; 
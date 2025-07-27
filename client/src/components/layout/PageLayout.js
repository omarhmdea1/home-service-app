import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui';

/**
 * Main Page Layout Component
 * 
 * Provides consistent structure for all pages with optional sidebar,
 * proper spacing, and responsive design.
 */
const PageLayout = ({
  children,
  sidebar,
  hasSidebar = false,
  maxWidth = 'default',
  background = 'bg-neutral-50',
  className = '',
  ...props
}) => {
  return (
    <div className={`min-h-screen ${background} ${className}`} {...props}>
      <div className="flex">
        {/* Sidebar */}
        {hasSidebar && sidebar && (
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-neutral-200 shadow-sm"
          >
            <div className="flex-1 flex flex-col overflow-y-auto">
              {sidebar}
            </div>
          </motion.aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${hasSidebar ? 'lg:pl-64' : ''}`}>
          <Container size={maxWidth} className="py-6 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </Container>
        </main>
      </div>
    </div>
  );
};

export default PageLayout; 
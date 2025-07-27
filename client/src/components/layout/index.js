/**
 * Layout System Exports
 * 
 * Comprehensive layout components for consistent page structures
 */

// Import components first
import PageLayoutComponent from './PageLayout';
import PageHeaderComponent from './PageHeader';
import {
  ContentSection,
  CardGrid,
  ListLayout,
  DetailLayout,
  StatsLayout,
  DashboardLayout,
} from './ContentLayout';
import {
  DashboardPageTemplate,
  ListPageTemplate,
  DetailPageTemplate,
  FormPageTemplate,
  SettingsPageTemplate,
  EmptyPageTemplate,
} from './PageTemplates';

// Core Layout Components
export { default as PageLayout } from './PageLayout';
export { default as PageHeader } from './PageHeader';

// Content Layout Components
export {
  ContentSection,
  CardGrid,
  ListLayout,
  DetailLayout,
  StatsLayout,
  DashboardLayout,
} from './ContentLayout';

// Page Templates
export {
  DashboardPageTemplate,
  ListPageTemplate,
  DetailPageTemplate,
  FormPageTemplate,
  SettingsPageTemplate,
  EmptyPageTemplate,
} from './PageTemplates';

// Export everything as default for convenience
export default {
  // Core
  PageLayout: PageLayoutComponent,
  PageHeader: PageHeaderComponent,
  
  // Content
  ContentSection,
  CardGrid,
  ListLayout,
  DetailLayout,
  StatsLayout,
  DashboardLayout,
  
  // Templates
  DashboardPageTemplate,
  ListPageTemplate,
  DetailPageTemplate,
  FormPageTemplate,
  SettingsPageTemplate,
  EmptyPageTemplate,
}; 
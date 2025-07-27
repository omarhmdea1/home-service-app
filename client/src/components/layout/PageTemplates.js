import React from 'react';
import PageLayout from './PageLayout';
import PageHeader from './PageHeader';
import { 
  ContentSection, 
  CardGrid, 
  ListLayout, 
  DetailLayout, 
  DashboardLayout 
} from './ContentLayout';
import { Button } from '../ui';

/**
 * Dashboard Page Template
 * 
 * Standard layout for dashboard pages with stats and quick actions
 */
export const DashboardPageTemplate = ({
  title = 'Dashboard',
  subtitle,
  icon,
  breadcrumbs = [],
  stats,
  quickActions,
  mainContent,
  sidebar,
  primaryAction,
  actions = [],
  background = 'bg-neutral-50',
  ...props
}) => {
  return (
    <PageLayout background={background} {...props}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        breadcrumbs={breadcrumbs}
        primaryAction={primaryAction}
        actions={actions}
      />
      
      <DashboardLayout
        stats={stats}
        quickActions={quickActions}
        mainContent={mainContent}
        sidebar={sidebar}
      />
    </PageLayout>
  );
};

/**
 * List Page Template
 * 
 * Standard layout for list/index pages
 */
export const ListPageTemplate = ({
  title,
  subtitle,
  description,
  icon,
  breadcrumbs = [],
  primaryAction,
  actions = [],
  filters,
  items = [],
  loading = false,
  error = null,
  empty = false,
  emptyTitle = 'No items found',
  emptyDescription = 'There are no items to display at the moment.',
  emptyAction,
  renderItem,
  layout = 'grid', // 'grid' | 'list'
  cols = 3,
  background = 'bg-neutral-50',
  ...props
}) => {
  return (
    <PageLayout background={background} {...props}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        description={description}
        icon={icon}
        breadcrumbs={breadcrumbs}
        primaryAction={primaryAction}
        actions={actions}
      />

      {/* Filters */}
      {filters && (
        <ContentSection spacing="lg" className="mb-12">
          {filters}
        </ContentSection>
      )}

      {/* Content */}
      <ContentSection spacing="lg">
        {layout === 'grid' ? (
          <CardGrid
            cols={cols}
            loading={loading}
            error={error}
            empty={empty}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={emptyAction}
          >
            {items.map((item, index) => 
              renderItem ? renderItem(item, index) : item
            )}
          </CardGrid>
        ) : (
          <ListLayout
            loading={loading}
            error={error}
            empty={empty}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={emptyAction}
          >
            {items.map((item, index) => 
              renderItem ? renderItem(item, index) : item
            )}
          </ListLayout>
        )}
      </ContentSection>
    </PageLayout>
  );
};

/**
 * Detail Page Template
 * 
 * Standard layout for detail/show pages
 */
export const DetailPageTemplate = ({
  title,
  subtitle,
  description,
  icon,
  badge,
  breadcrumbs = [],
  backButton,
  primaryAction,
  actions = [],
  mainContent,
  sidebar,
  sidebarPosition = 'right',
  tabs,
  background = 'bg-neutral-50',
  ...props
}) => {
  return (
    <PageLayout background={background} {...props}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        description={description}
        icon={icon}
        badge={badge}
        breadcrumbs={breadcrumbs}
        backButton={backButton}
        primaryAction={primaryAction}
        actions={actions}
      />

      {/* Tabs */}
      {tabs && (
        <ContentSection>
          {tabs}
        </ContentSection>
      )}

      {/* Content */}
      <ContentSection>
        {sidebar ? (
          <DetailLayout 
            main={mainContent} 
            sidebar={sidebar}
            sidebarPosition={sidebarPosition}
          />
        ) : (
          mainContent
        )}
      </ContentSection>
    </PageLayout>
  );
};

/**
 * Form Page Template
 * 
 * Standard layout for form pages (create/edit)
 */
export const FormPageTemplate = ({
  title,
  subtitle,
  description,
  icon,
  breadcrumbs = [],
  backButton,
  form,
  sidebar,
  sidebarPosition = 'right',
  background = 'bg-neutral-50',
  ...props
}) => {
  return (
    <PageLayout background={background} {...props}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        description={description}
        icon={icon}
        breadcrumbs={breadcrumbs}
        backButton={backButton}
      />

      <ContentSection>
        {sidebar ? (
          <DetailLayout 
            main={form} 
            sidebar={sidebar}
            sidebarPosition={sidebarPosition}
          />
        ) : (
          form
        )}
      </ContentSection>
    </PageLayout>
  );
};

/**
 * Settings Page Template
 * 
 * Standard layout for settings/preferences pages
 */
export const SettingsPageTemplate = ({
  title = 'Settings',
  subtitle,
  description,
  icon,
  breadcrumbs = [],
  sections = [],
  sidebar,
  background = 'bg-neutral-50',
  ...props
}) => {
  return (
    <PageLayout background={background} hasSidebar={!!sidebar} sidebar={sidebar} {...props}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        description={description}
        icon={icon}
        breadcrumbs={breadcrumbs}
      />

      <ContentSection spacing="xl">
        {sections.map((section, index) => (
          <ContentSection
            key={index}
            title={section.title}
            subtitle={section.subtitle}
          >
            {section.content}
          </ContentSection>
        ))}
      </ContentSection>
    </PageLayout>
  );
};

/**
 * Empty State Page Template
 * 
 * Layout for empty states and onboarding
 */
export const EmptyPageTemplate = ({
  title,
  subtitle,
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  background = 'bg-neutral-50',
  ...props
}) => {
  return (
    <PageLayout background={background} {...props}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          {illustration && (
            <div className="mb-8">
              {illustration}
            </div>
          )}
          
          {icon && (
            <div className="text-6xl mb-6">
              {icon}
            </div>
          )}
          
          <PageHeader
            title={title}
            subtitle={subtitle}
            description={description}
            className="mb-8"
          />
          
          <div className="space-y-3">
            {primaryAction && primaryAction}
            {secondaryAction && secondaryAction}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default {
  DashboardPageTemplate,
  ListPageTemplate,
  DetailPageTemplate,
  FormPageTemplate,
  SettingsPageTemplate,
  EmptyPageTemplate,
}; 
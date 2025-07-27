# 🏗️ Layout System Documentation

## Overview

The Layout System provides a comprehensive set of templates and components to ensure consistent page structure across the Home Service Application. Every page follows a unified structure with standardized headers, content areas, and navigation patterns.

## 🎯 Layout Principles

### 1. **Consistent Structure**
- Header + Main content area with standardized padding
- Optional sidebar for additional context
- Uniform spacing and visual hierarchy
- Responsive design patterns

### 2. **Flexible Templates**
- Pre-built templates for common page types
- Configurable components for different use cases
- Consistent action placement (top-right CTAs)
- Standardized navigation patterns

### 3. **Professional Aesthetics**
- Clean page headers with icons and breadcrumbs
- Consistent card/grid layouts for content
- Proper loading and empty states
- Professional spacing and typography

## 🧩 Core Components

### PageLayout
Base layout wrapper that provides consistent structure for all pages.

```jsx
import { PageLayout } from '@/components/layout';

<PageLayout 
  background="bg-neutral-50"
  maxWidth="default"
  hasSidebar={false}
>
  {/* Page content */}
</PageLayout>
```

**Props:**
- `background`: Page background color
- `maxWidth`: Container max width ('sm' | 'default' | 'lg' | 'full')
- `hasSidebar`: Whether page has a sidebar
- `sidebar`: Sidebar content

### PageHeader
Standardized page header with title, actions, and navigation.

```jsx
import { PageHeader } from '@/components/layout';

<PageHeader
  title="Service Dashboard"
  subtitle="Manage your home services"
  icon={<HomeIcon />}
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Dashboard' }
  ]}
  primaryAction={{
    label: 'Add Service',
    onClick: handleAdd,
    icon: <PlusIcon />
  }}
  actions={[
    { label: 'Export', variant: 'outline' },
    { label: 'Filter', variant: 'ghost' }
  ]}
  backButton={{
    onClick: () => navigate(-1),
    label: 'Go back'
  }}
/>
```

**Props:**
- `title`: Page title (required)
- `subtitle`: Page subtitle
- `description`: Longer description
- `icon`: Title icon
- `badge`: Status badge
- `breadcrumbs`: Navigation breadcrumbs array
- `primaryAction`: Main action button config
- `actions`: Secondary actions array
- `backButton`: Back navigation config

## 📄 Page Templates

### DashboardPageTemplate
Standard layout for dashboard pages with stats and quick actions.

```jsx
import { DashboardPageTemplate } from '@/components/layout';

<DashboardPageTemplate
  title="Service Dashboard"
  subtitle="Manage your home services"
  icon={<HomeIcon />}
  stats={<StatsLayout>{statsComponents}</StatsLayout>}
  quickActions={<CardGrid>{actionCards}</CardGrid>}
  mainContent={<RecentActivity />}
  sidebar={<QuickStats />}
  primaryAction={{
    label: 'Add Service',
    onClick: handleAdd
  }}
/>
```

### ListPageTemplate
Standard layout for list/index pages with filtering and grid/list views.

```jsx
import { ListPageTemplate } from '@/components/layout';

<ListPageTemplate
  title="Service Catalog"
  subtitle="Browse all available services"
  icon={<ListIcon />}
  filters={<FilterPanel />}
  items={services}
  renderItem={(service, index) => (
    <ServiceCard key={service.id} service={service} index={index} />
  )}
  layout="grid"
  cols={3}
  loading={loading}
  empty={services.length === 0}
  emptyAction={<Button>Add First Service</Button>}
  primaryAction={{
    label: 'Add Service',
    onClick: handleAdd
  }}
/>
```

### DetailPageTemplate
Standard layout for detail/show pages with main content and optional sidebar.

```jsx
import { DetailPageTemplate } from '@/components/layout';

<DetailPageTemplate
  title="Professional House Cleaning"
  subtitle="Complete cleaning service for your home"
  icon={<CleaningIcon />}
  badge={{ text: 'Popular', variant: 'success' }}
  breadcrumbs={breadcrumbs}
  backButton={{ onClick: () => navigate(-1) }}
  mainContent={<ServiceDetails />}
  sidebar={<ProviderInfo />}
  primaryAction={{
    label: 'Book Now',
    onClick: handleBook
  }}
  actions={[
    { label: 'Share', variant: 'outline' },
    { label: 'Save', variant: 'ghost' }
  ]}
/>
```

### FormPageTemplate
Standard layout for form pages (create/edit).

```jsx
import { FormPageTemplate } from '@/components/layout';

<FormPageTemplate
  title="Add New Service"
  subtitle="Create a new service offering"
  icon={<PlusIcon />}
  breadcrumbs={breadcrumbs}
  backButton={{ onClick: () => navigate(-1) }}
  form={<ServiceForm />}
  sidebar={<FormTips />}
/>
```

### EmptyPageTemplate
Layout for empty states and onboarding.

```jsx
import { EmptyPageTemplate } from '@/components/layout';

<EmptyPageTemplate
  title="No Services Yet"
  subtitle="Start by adding your first service"
  description="Services help customers find exactly what they need."
  icon="🏠"
  primaryAction={
    <Button variant="primary" size="lg" onClick={handleAdd}>
      Add Your First Service
    </Button>
  }
  secondaryAction={
    <Button variant="outline" onClick={handleImport}>
      Import from Template
    </Button>
  }
/>
```

## 🎨 Content Layout Components

### ContentSection
Provides consistent spacing and styling for page sections.

```jsx
import { ContentSection } from '@/components/layout';

<ContentSection 
  title="Recent Activity"
  subtitle="Your latest bookings and activities"
  actions={<Button>View All</Button>}
>
  <RecentActivityList />
</ContentSection>
```

### CardGrid
Responsive grid for cards with built-in loading and empty states.

```jsx
import { CardGrid } from '@/components/layout';

<CardGrid
  cols={3}
  gap="lg"
  loading={loading}
  empty={items.length === 0}
  emptyTitle="No services found"
  emptyAction={<Button>Add Service</Button>}
>
  {items.map(item => <ServiceCard key={item.id} service={item} />)}
</CardGrid>
```

### ListLayout
Vertical list with consistent spacing and dividers.

```jsx
import { ListLayout } from '@/components/layout';

<ListLayout
  divided={true}
  loading={loading}
  empty={bookings.length === 0}
  emptyTitle="No bookings yet"
>
  {bookings.map(booking => <BookingItem key={booking.id} booking={booking} />)}
</ListLayout>
```

### DetailLayout
Two-column layout for detail pages.

```jsx
import { DetailLayout } from '@/components/layout';

<DetailLayout
  main={<MainContent />}
  sidebar={<SidebarContent />}
  sidebarPosition="right"
/>
```

## 🚀 Migration Examples

### Before: Inconsistent Layout

```jsx
// ❌ Old inconsistent approach
const ServiceList = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Services</h1>
        <div className="grid grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### After: Unified Layout System

```jsx
// ✅ New consistent approach
import { ListPageTemplate } from '@/components/layout';
import { ServiceCard } from '@/components/ui';

const ServiceList = () => {
  return (
    <ListPageTemplate
      title="Service Catalog"
      subtitle="Browse all available services"
      icon={<ServicesIcon />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Services' }
      ]}
      primaryAction={{
        label: 'Add Service',
        onClick: handleAdd,
        icon: <PlusIcon />
      }}
      items={services}
      renderItem={(service, index) => (
        <ServiceCard key={service.id} service={service} index={index} />
      )}
      layout="grid"
      cols={3}
      loading={loading}
      empty={services.length === 0}
      emptyAction={
        <Button variant="primary" onClick={handleAdd}>
          Add Your First Service
        </Button>
      }
    />
  );
};
```

## 📱 Responsive Design

All layout components are mobile-first and responsive:

```jsx
// Automatic responsive behavior
<CardGrid 
  cols={1}  // 1 column on mobile
  className="md:grid-cols-2 lg:grid-cols-3"  // 2 on tablet, 3 on desktop
>
  {items.map(item => <Card key={item.id} />)}
</CardGrid>

// Responsive sidebar
<DetailLayout
  main={<MainContent />}
  sidebar={<Sidebar />}  // Hidden on mobile, shows on lg+ screens
/>
```

## 🎯 Consistent Action Patterns

### Primary Actions (Top-right CTAs)
```jsx
// Always use primaryAction for main page action
<PageHeader
  title="Services"
  primaryAction={{
    label: 'Add Service',
    onClick: handleAdd,
    icon: <PlusIcon />
  }}
/>
```

### Secondary Actions
```jsx
// Use actions array for secondary actions
<PageHeader
  title="Services"
  actions={[
    { label: 'Export', variant: 'outline', onClick: handleExport },
    { label: 'Import', variant: 'ghost', onClick: handleImport },
    { label: 'Filter', variant: 'ghost', onClick: handleFilter }
  ]}
  primaryAction={{
    label: 'Add Service',
    onClick: handleAdd
  }}
/>
```

### Floating/Fixed Actions
```jsx
// For mobile-friendly floating actions
<div className="fixed bottom-6 right-6 lg:hidden">
  <Button
    variant="primary"
    size="lg"
    className="rounded-full shadow-lg"
    onClick={handleAdd}
  >
    <PlusIcon />
  </Button>
</div>
```

## 🔧 Customization

### Custom Page Template
```jsx
import { PageLayout, PageHeader, ContentSection } from '@/components/layout';

const CustomPageTemplate = ({ title, children, ...props }) => {
  return (
    <PageLayout {...props}>
      <PageHeader
        title={title}
        icon={<CustomIcon />}
        breadcrumbs={generateBreadcrumbs()}
      />
      
      <ContentSection>
        {children}
      </ContentSection>
    </PageLayout>
  );
};
```

### Extending Templates
```jsx
// Wrap existing templates for domain-specific needs
const ProviderDashboard = (props) => (
  <DashboardPageTemplate
    {...props}
    title="Provider Dashboard"
    icon={<ProviderIcon />}
    breadcrumbs={providerBreadcrumbs}
    primaryAction={defaultProviderAction}
  />
);
```

## 📊 Benefits Achieved

### Before Layout System
- ❌ Inconsistent page headers across different pages
- ❌ Mixed spacing and padding patterns
- ❌ Varied action button placements  
- ❌ Different loading and empty state designs
- ❌ No standardized navigation patterns

### After Layout System
- ✅ Consistent page structure across all views
- ✅ Standardized 6 page templates for common patterns
- ✅ Unified header design with breadcrumbs and actions
- ✅ Professional loading and empty states
- ✅ Responsive design patterns built-in

## 📦 File Structure

```
src/
├── components/
│   └── layout/
│       ├── index.js              # Main exports
│       ├── PageLayout.js         # Base page wrapper
│       ├── PageHeader.js         # Standardized headers
│       ├── ContentLayout.js      # Content organization
│       ├── PageTemplates.js      # Pre-built templates
│       └── examples/
│           └── LayoutShowcase.js # Live examples
```

## 🎯 Best Practices

### 1. **Always Use Templates**
Start with a template instead of building custom layouts:
```jsx
// ✅ Good
<ListPageTemplate title="Services" items={services} />

// ❌ Avoid
<div className="min-h-screen">
  <h1>Services</h1>
  {/* Custom layout */}
</div>
```

### 2. **Consistent Action Placement**
Keep primary actions in the top-right:
```jsx
<PageHeader
  title="Services"
  primaryAction={{ label: 'Add Service', onClick: handleAdd }}
/>
```

### 3. **Use Proper Breadcrumbs**
Always provide navigation context:
```jsx
breadcrumbs={[
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'House Cleaning' }
]}
```

### 4. **Handle All States**
Include loading, empty, and error states:
```jsx
<CardGrid
  loading={loading}
  empty={items.length === 0}
  error={error}
  emptyAction={<Button>Add Item</Button>}
>
  {items.map(item => <Card key={item.id} />)}
</CardGrid>
```

## 🔗 Quick Reference

```jsx
// Essential imports for most pages
import {
  DashboardPageTemplate,     // Dashboard layout
  ListPageTemplate,          // List/index pages  
  DetailPageTemplate,        // Detail/show pages
  FormPageTemplate,          // Create/edit forms
  EmptyPageTemplate,         // Empty states
  ContentSection,            // Content organization
  CardGrid,                  // Responsive grids
  ListLayout,                // Vertical lists
} from '@/components/layout';
```

---

This layout system ensures every page in your application follows consistent patterns while remaining flexible enough for specific use cases. For questions or contributions, please refer to the component documentation or create an issue in the repository. 
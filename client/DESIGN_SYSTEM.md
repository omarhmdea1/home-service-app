# 🎨 Design System Documentation

## Overview

This design system provides a comprehensive set of components, tokens, and guidelines to ensure consistent, professional, and accessible user interface across the Home Service Application.

## 🎯 Design Principles

### 1. **Consistency**
- Unified color palette across all components
- Consistent spacing using 4px base system
- Standardized typography scale
- Uniform border radius and shadow styles

### 2. **Accessibility**
- WCAG 2.1 AA compliant color contrasts
- Focus states for keyboard navigation
- Screen reader friendly components
- Semantic HTML structure

### 3. **Professional Aesthetics**
- Clean, modern visual design
- Subtle animations and transitions
- Professional color palette
- Consistent visual hierarchy

### 4. **Developer Experience**
- TypeScript-ready prop interfaces
- Comprehensive component documentation
- Reusable and composable components
- Easy customization through props

## 🎨 Design Tokens

### Color System

```javascript
// Primary Brand Colors (Professional Blue)
primary: {
  50: '#f0f9ff',   // Lightest blue
  600: '#0284c7',  // Primary action color
  700: '#0369a1',  // Hover state
}

// Semantic Colors
success: '#22c55e',  // Green for positive actions
warning: '#f59e0b',  // Amber for warnings  
error: '#ef4444',    // Red for errors
neutral: '#6b7280',  // Gray for text and borders
```

### Typography Scale

```javascript
// Display Text (Hero sections)
display: {
  large: 'text-5xl md:text-6xl font-bold',
  medium: 'text-4xl md:text-5xl font-bold', 
  small: 'text-3xl md:text-4xl font-bold'
}

// Headings
heading: {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-semibold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold'
}

// Body Text
body: {
  large: 'text-lg leading-relaxed',
  default: 'text-base leading-normal',
  small: 'text-sm leading-normal'
}
```

### Spacing System (4px base)

```javascript
spacing: {
  xs: '8px',   // p-2
  sm: '12px',  // p-3  
  md: '16px',  // p-4
  lg: '24px',  // p-6
  xl: '32px',  // p-8
  '2xl': '48px' // p-12
}
```

## 🧩 Core Components

### Button Component

```jsx
import { Button } from '@/components/ui';

// Basic usage
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// With loading state
<Button loading disabled>
  Processing...
</Button>

// With icon
<Button icon={<IconStar />} iconPosition="left">
  Favorite
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right'

### Card Component

```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card hover variant="elevated">
  <CardHeader>
    <CardTitle>Service Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your content here...</p>
  </CardContent>
</Card>
```

**Props:**
- `variant`: 'default' | 'hover' | 'elevated'
- `hover`: boolean (adds hover effects)

### Form Components

```jsx
import { 
  Form, 
  FormInput, 
  FormTextarea, 
  FormSelect, 
  FormActions,
  FormSubmitButton 
} from '@/components/ui';

<Form onSubmit={handleSubmit}>
  <FormInput
    label="Email Address"
    name="email"
    type="email"
    required
    icon={<EmailIcon />}
    helper="We'll never share your email"
  />
  
  <FormTextarea
    label="Message"
    name="message"
    maxLength={500}
    showCharCount
  />
  
  <FormSelect
    label="Category"
    name="category"
    options={[
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'plumbing', label: 'Plumbing' }
    ]}
  />
  
  <FormActions align="right">
    <Button variant="ghost" type="button">Cancel</Button>
    <FormSubmitButton loading={isSubmitting}>
      Submit
    </FormSubmitButton>
  </FormActions>
</Form>
```

### Layout Components

```jsx
import { Container, Stack, Grid } from '@/components/ui';

// Container for page content
<Container size="default">
  <Stack spacing="lg">
    <h1>Page Title</h1>
    
    {/* Grid layout */}
    <Grid cols={3} gap="md">
      <ServiceCard />
      <ServiceCard />
      <ServiceCard />
    </Grid>
  </Stack>
</Container>
```

### Custom Components

#### ServiceCard

```jsx
import { ServiceCard } from '@/components/ui';

<ServiceCard
  service={{
    _id: '1',
    title: 'House Cleaning',
    description: 'Professional cleaning service',
    price: 120,
    category: 'cleaning',
    rating: 4.8
  }}
  index={0}
  showImage={true}
  onClick={handleServiceClick}
/>
```

#### ActionCard

```jsx
import { ActionCard } from '@/components/ui';

<ActionCard
  icon={<CalendarIcon />}
  title="Schedule Service"
  subtitle="Book your appointment"
  variant="primary"
  badge="Popular"
  onClick={handleSchedule}
/>
```

## 🎨 Usage Examples

### Before: Inconsistent Styling

```jsx
// ❌ Old inconsistent approach
<div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
  <h3 className="text-lg font-bold text-gray-900 mb-2">Service Title</h3>
  <p className="text-sm text-gray-600 mb-4">Description...</p>
  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
    Book Now
  </button>
</div>
```

### After: Design System Approach

```jsx
// ✅ New consistent approach
import { Card, CardContent, Heading, Text, Button } from '@/components/ui';

<Card hover>
  <CardContent>
    <Heading level={3} className="mb-2">Service Title</Heading>
    <Text size="small" className="text-neutral-600 mb-4">
      Description...
    </Text>
    <Button variant="primary">Book Now</Button>
  </CardContent>
</Card>
```

## 🔧 Customization

### Extending Colors

```javascript
// In tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          600: '#0284c7',
          // Add custom brand colors
        }
      }
    }
  }
}
```

### Creating Custom Components

```jsx
// Custom component following design system
import { Card, Button, designTokens } from '@/components/ui';

const CustomServiceCard = ({ service, ...props }) => {
  return (
    <Card 
      hover 
      className={designTokens.shadows.card}
      {...props}
    >
      {/* Your custom content */}
      <Button variant="primary">
        {service.title}
      </Button>
    </Card>
  );
};
```

## 📱 Responsive Design

All components are mobile-first and responsive:

```jsx
// Responsive grid
<Grid 
  cols={1}           // 1 column on mobile
  className="md:grid-cols-2 lg:grid-cols-3" // 2 cols on tablet, 3 on desktop
>
  {services.map(service => (
    <ServiceCard key={service.id} service={service} />
  ))}
</Grid>
```

## ♿ Accessibility Features

- **Focus Management**: All interactive elements have visible focus states
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Screen reader support for complex components
- **Color Contrast**: WCAG AA compliant color combinations
- **Keyboard Navigation**: Full keyboard accessibility

## 🚀 Migration Guide

### Step 1: Import New Components

```jsx
// Replace old imports
import { Button } from '@/components/ui';
```

### Step 2: Update Component Usage

```jsx
// Old
<button className="bg-blue-600 text-white px-4 py-2 rounded">
  Click Me
</button>

// New
<Button variant="primary">
  Click Me
</Button>
```

### Step 3: Leverage Design Tokens

```jsx
// Use design tokens for custom styling
import { designTokens } from '@/components/ui';

const customStyles = {
  padding: designTokens.spacing.md,
  borderRadius: designTokens.radius.large,
  color: designTokens.colors.primary.text
};
```

## 📦 File Structure

```
src/
├── components/
│   └── ui/
│       ├── index.js           # Main exports
│       ├── ActionCard.js      # Dashboard action cards
│       ├── ServiceCard.js     # Service display cards  
│       ├── Form.js           # Form components
│       └── examples/
│           └── DesignSystemShowcase.js
├── styles/
│   └── designTokens.js       # Design system tokens
└── tailwind.config.js        # Enhanced Tailwind config
```

## 📊 Benefits Achieved

### Before Design System
- ❌ 15+ different button styles across pages
- ❌ Inconsistent padding (p-4, p-5, p-6)
- ❌ Mixed border radius (rounded, rounded-lg, rounded-xl)
- ❌ Multiple shadow variations
- ❌ Inconsistent color usage

### After Design System  
- ✅ Unified 7 button variants with consistent sizing
- ✅ Standardized 4px-based spacing system
- ✅ Consistent 8px border radius system
- ✅ 3 semantic shadow levels
- ✅ Professional 6-color semantic palette

## 🎯 Next Steps

1. **Gradual Migration**: Update existing components page by page
2. **Team Training**: Ensure all developers understand the system
3. **Design Review**: Review all new components against design system
4. **Performance**: Monitor bundle size and optimize as needed
5. **Accessibility Audit**: Regular accessibility testing

## 🔗 Quick Reference

```jsx
// Essential imports for most use cases
import {
  Container, Stack, Grid,           // Layout
  Card, CardHeader, CardTitle,      // Cards  
  Button, Badge, Alert,             // Interactive
  Heading, Text, Caption,           // Typography
  Form, FormInput, FormActions,     // Forms
  ServiceCard, ActionCard           // Custom
} from '@/components/ui';
```

---

For questions or contributions to the design system, please refer to the team documentation or create an issue in the repository. 
import React, { useState } from 'react';
import {
  Container,
  Stack,
  Grid,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Input,
  Textarea,
  Alert,
  Spinner,
  LoadingState,
  Display,
  Heading,
  Text,
  Caption,
  Form,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormActions,
  FormSubmitButton,
  ServiceCard,
  ActionCard,
  designTokens,
} from '../index';

/**
 * Design System Showcase Component
 * 
 * This component demonstrates all the design system components
 * and their various states and configurations.
 */
const DesignSystemShowcase = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: '',
    subscribe: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      alert('Form submitted successfully!');
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Sample data
  const sampleService = {
    _id: '1',
    title: 'Professional House Cleaning',
    description: 'Comprehensive cleaning service for your home with eco-friendly products.',
    price: 120,
    category: 'cleaning',
    rating: 4.8,
    providerName: 'Clean Pro Services',
  };

  const categoryOptions = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'gardening', label: 'Gardening' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <Container>
        <Stack spacing="xl">
          {/* Header */}
          <div className="text-center">
            <Display size="medium" className="text-neutral-900 mb-4">
              Design System Showcase
            </Display>
            <Text size="large" className="text-neutral-600 max-w-2xl mx-auto">
              Explore our comprehensive design system with consistent components, 
              unified styling, and professional interactions.
            </Text>
          </div>

          {/* Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle>Color System</CardTitle>
            </CardHeader>
            <CardContent>
              <Grid cols={4} gap="md">
                {Object.entries({
                  Primary: 'primary',
                  Secondary: 'secondary', 
                  Success: 'success',
                  Warning: 'warning',
                  Error: 'error',
                  Neutral: 'neutral'
                }).map(([name, color]) => (
                  <div key={color} className="space-y-2">
                    <Text size="small" className="font-medium">
                      {name}
                    </Text>
                    <div className="grid grid-cols-5 gap-1">
                      {[50, 100, 300, 600, 900].map(shade => (
                        <div
                          key={shade}
                          className={`h-12 rounded-md bg-${color}-${shade} border border-neutral-200`}
                          title={`${color}-${shade}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack spacing="md">
                <Display size="small">Display Text</Display>
                <Heading level={1}>Heading 1</Heading>
                <Heading level={2}>Heading 2</Heading>
                <Heading level={3}>Heading 3</Heading>
                <Text size="large">Large body text for important content</Text>
                <Text>Default body text for general content</Text>
                <Text size="small">Small text for details and metadata</Text>
                <Caption>Caption text for very small details</Caption>
              </Stack>
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack spacing="lg">
                <div>
                  <Text size="small" className="font-medium mb-3">
                    Variants
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="error">Error</Button>
                  </div>
                </div>

                <div>
                  <Text size="small" className="font-medium mb-3">
                    Sizes
                  </Text>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="xs">Extra Small</Button>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </div>

                <div>
                  <Text size="small" className="font-medium mb-3">
                    States
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button 
                      icon={<span>🚀</span>} 
                      iconPosition="left"
                    >
                      With Icon
                    </Button>
                  </div>
                </div>
              </Stack>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badge Components</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack spacing="md">
                <div>
                  <Text size="small" className="font-medium mb-3">
                    Variants
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="neutral">Neutral</Badge>
                  </div>
                </div>

                <div>
                  <Text size="small" className="font-medium mb-3">
                    Sizes
                  </Text>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>
              </Stack>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack spacing="md">
                <Alert variant="info" title="Information">
                  This is an informational message with useful details.
                </Alert>
                <Alert variant="success" title="Success">
                  Your action was completed successfully!
                </Alert>
                <Alert variant="warning" title="Warning">
                  Please review the following information carefully.
                </Alert>
                <Alert variant="error" title="Error">
                  An error occurred while processing your request.
                </Alert>
              </Stack>
            </CardContent>
          </Card>

          {/* Form Components */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
            </CardHeader>
            <CardContent>
              <Form onSubmit={handleSubmit}>
                <Grid cols={2} gap="lg">
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    icon={<span>👤</span>}
                  />

                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    icon={<span>✉️</span>}
                  />
                </Grid>

                <FormSelect
                  label="Service Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={categoryOptions}
                  placeholder="Select a category"
                  required
                />

                <FormTextarea
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your project..."
                  rows={4}
                  maxLength={500}
                  showCharCount
                  helper="Describe your requirements in detail"
                />

                <FormCheckbox
                  label="Subscribe to newsletter"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleInputChange}
                  description="Get updates about new services and offers"
                />

                <FormActions align="between">
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                  <FormSubmitButton loading={loading}>
                    Submit Request
                  </FormSubmitButton>
                </FormActions>
              </Form>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Card Components</CardTitle>
            </CardHeader>
            <CardContent>
              <Grid cols={3} gap="lg">
                {/* Service Card */}
                <ServiceCard service={sampleService} index={0} />
                
                {/* Action Cards */}
                <ActionCard
                  icon={<span className="text-2xl">📅</span>}
                  title="Schedule Service"
                  subtitle="Book your next service appointment"
                  variant="primary"
                  onClick={() => alert('Schedule clicked')}
                />
                
                <ActionCard
                  icon={<span className="text-2xl">💬</span>}
                  title="Customer Support"
                  subtitle="Get help with your questions"
                  variant="secondary"
                  badge="24/7"
                  onClick={() => alert('Support clicked')}
                />
              </Grid>
            </CardContent>
          </Card>

          {/* Loading States */}
          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack spacing="lg">
                <div>
                  <Text size="small" className="font-medium mb-3">
                    Spinners
                  </Text>
                  <div className="flex items-center gap-4">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Spinner size="xl" />
                  </div>
                </div>

                <div>
                  <Text size="small" className="font-medium mb-3">
                    Loading State Component
                  </Text>
                  <div className="border rounded-lg p-4">
                    <LoadingState 
                      title="Loading Services"
                      description="Please wait while we fetch your data..."
                    />
                  </div>
                </div>
              </Stack>
            </CardContent>
          </Card>

          {/* Layout Components */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Components</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack spacing="lg">
                <div>
                  <Text size="small" className="font-medium mb-3">
                    Container Sizes
                  </Text>
                  <Stack spacing="sm">
                    <Container size="sm" className="bg-primary-50 p-4 rounded">
                      <Text className="text-center">Small Container (max-w-2xl)</Text>
                    </Container>
                    <Container size="default" className="bg-primary-50 p-4 rounded">
                      <Text className="text-center">Default Container (max-w-7xl)</Text>
                    </Container>
                  </Stack>
                </div>

                <div>
                  <Text size="small" className="font-medium mb-3">
                    Grid System
                  </Text>
                  <Grid cols={4} gap="md">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-secondary-100 p-4 rounded text-center">
                        <Text>Grid Item {i}</Text>
                      </div>
                    ))}
                  </Grid>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};

export default DesignSystemShowcase; 
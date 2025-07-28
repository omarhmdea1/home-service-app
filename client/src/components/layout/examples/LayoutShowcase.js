import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DashboardPageTemplate,
  ListPageTemplate,
  DetailPageTemplate,
  FormPageTemplate,
  SettingsPageTemplate,
  EmptyPageTemplate,
  ContentSection,
  CardGrid,
  StatsLayout,
} from '../index';
import {
  Button,
  Card,
  CardContent,
  Badge,
  ServiceCard,
  ActionCard,
  Heading,
  Text,
  FormInput,
  FormTextarea,
  FormActions,
  FormSubmitButton,
  Alert,
} from '../../ui';
import { motion } from 'framer-motion';
import { formatPrice, formatCurrency } from '../../../utils/formatters';

/**
 * Layout System Showcase
 * 
 * Demonstrates all the layout templates and components
 */
const LayoutShowcase = () => {
  const navigate = useNavigate();
  const [currentTemplate, setCurrentTemplate] = useState('dashboard');

  // Sample data
  const sampleServices = [
    {
      _id: '1',
      title: 'Professional House Cleaning',
      description: 'Complete cleaning service for your home',
      price: 120,
      category: 'cleaning',
      rating: 4.8,
    },
    {
      _id: '2',
      title: 'Plumbing Repair',
      description: 'Expert plumbing solutions',
      price: 80,
      category: 'plumbing',
      rating: 4.9,
    },
    {
      _id: '3',
      title: 'Garden Maintenance',
      description: 'Keep your garden beautiful',
      price: 60,
      category: 'gardening',
      rating: 4.7,
    },
  ];

  const statsData = (
    <StatsLayout cols={4}>
      <StatCard title="Total Services" value="24" icon="🏠" />
      <StatCard title="Active Bookings" value="8" icon="📅" />
      <StatCard title="Completed" value="156" icon="✅" />
      <StatCard title="Revenue" value={formatCurrency(12450)} icon="💰" />
    </StatsLayout>
  );

  const quickActionsData = (
    <CardGrid cols={4}>
      <ActionCard
        icon={<span className="text-2xl">📋</span>}
        title="Book Service"
        subtitle="Schedule a new service"
        variant="primary"
        onClick={() => alert('Book Service')}
      />
      <ActionCard
        icon={<span className="text-2xl">👥</span>}
        title="Manage Providers"
        subtitle="View all service providers"
        variant="secondary"
        onClick={() => alert('Manage Providers')}
      />
      <ActionCard
        icon={<span className="text-2xl">📊</span>}
        title="View Reports"
        subtitle="Analytics and insights"
        variant="success"
        onClick={() => alert('View Reports')}
      />
      <ActionCard
        icon={<span className="text-2xl">⚙️</span>}
        title="Settings"
        subtitle="Configure your account"
        onClick={() => alert('Settings')}
      />
    </CardGrid>
  );

  const renderTemplate = () => {
    switch (currentTemplate) {
      case 'dashboard':
        return (
          <DashboardPageTemplate
            title="Service Dashboard"
            subtitle="Manage your home services"
            icon={<span>🏠</span>}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard' }
            ]}
            primaryAction={{
              label: 'Add Service',
              onClick: () => alert('Add Service'),
              icon: <span>➕</span>
            }}
            actions={[
              { label: 'Export', variant: 'outline' },
              { label: 'Filter', variant: 'ghost' }
            ]}
            stats={statsData}
            quickActions={quickActionsData}
            mainContent={
              <ContentSection title="Recent Activity">
                <Card>
                  <CardContent>
                    <Text>Recent bookings and activities will appear here...</Text>
                  </CardContent>
                </Card>
              </ContentSection>
            }
            sidebar={
              <Card>
                <CardContent>
                  <Heading level={4} className="mb-4">Quick Stats</Heading>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Text size="small">This Week</Text>
                      <Badge variant="success">+12%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <Text size="small">This Month</Text>
                      <Badge variant="primary">+8%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
          />
        );

      case 'list':
        return (
          <ListPageTemplate
            title="Service Catalog"
            subtitle="Browse all available services"
            description="Find the perfect service for your needs"
            icon={<span>📋</span>}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Services' }
            ]}
            primaryAction={{
              label: 'Add Service',
              onClick: () => alert('Add Service'),
              icon: <span>➕</span>
            }}
            actions={[
              { label: 'Import', variant: 'outline' },
              { label: 'Filter', variant: 'ghost' }
            ]}
            filters={
              <Card>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput placeholder="Search services..." />
                    <select className="px-3 py-2 border border-neutral-300 rounded-lg">
                      <option>All Categories</option>
                      <option>Cleaning</option>
                      <option>Plumbing</option>
                      <option>Gardening</option>
                    </select>
                    <select className="px-3 py-2 border border-neutral-300 rounded-lg">
                      <option>All Prices</option>
                      <option>Under 100</option>
                      <option>100 - 200</option>
                      <option>Over 200</option>
                    </select>
                    <Button variant="primary">Apply Filters</Button>
                  </div>
                </CardContent>
              </Card>
            }
            items={sampleServices}
            renderItem={(service, index) => (
              <ServiceCard key={service._id} service={service} index={index} />
            )}
            layout="grid"
            cols={3}
            emptyAction={
              <Button variant="primary" onClick={() => alert('Add first service')}>
                Add Your First Service
              </Button>
            }
          />
        );

      case 'detail':
        return (
          <DetailPageTemplate
            title="Professional House Cleaning"
            subtitle="Complete cleaning service for your home"
            description="Our professional cleaning service includes deep cleaning of all rooms, kitchen, bathrooms, and common areas."
            icon={<span>🧹</span>}
            badge={{ text: 'Popular', variant: 'success' }}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/services' },
              { label: 'House Cleaning' }
            ]}
            backButton={{
              onClick: () => navigate(-1),
              label: 'Back to Services'
            }}
            primaryAction={{
              label: 'Book Now',
              onClick: () => alert('Book Service'),
              icon: <span>📅</span>
            }}
            actions={[
              { label: 'Share', variant: 'outline', icon: <span>🔗</span> },
              { label: 'Save', variant: 'ghost', icon: <span>❤️</span> }
            ]}
            mainContent={
              <div className="space-y-8">
                <Card>
                  <CardContent>
                    <Heading level={3} className="mb-4">Service Details</Heading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Text className="font-medium mb-2">Duration</Text>
                        <Text className="text-neutral-600">2-3 hours</Text>
                      </div>
                      <div>
                        <Text className="font-medium mb-2">Price</Text>
                        <Text className="text-neutral-600">{formatPrice(120)}</Text>
                      </div>
                      <div>
                        <Text className="font-medium mb-2">Category</Text>
                        <Badge>Cleaning</Badge>
                      </div>
                      <div>
                        <Text className="font-medium mb-2">Rating</Text>
                        <div className="flex items-center">
                          <Text className="text-neutral-600">4.8/5</Text>
                          <Text size="small" className="text-neutral-500 ml-2">(24 reviews)</Text>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Heading level={3} className="mb-4">What's Included</Heading>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <span className="text-success-600 mr-2">✓</span>
                        <Text>Deep cleaning of all rooms</Text>
                      </li>
                      <li className="flex items-center">
                        <span className="text-success-600 mr-2">✓</span>
                        <Text>Kitchen and bathroom cleaning</Text>
                      </li>
                      <li className="flex items-center">
                        <span className="text-success-600 mr-2">✓</span>
                        <Text>Vacuum and mop all floors</Text>
                      </li>
                      <li className="flex items-center">
                        <span className="text-success-600 mr-2">✓</span>
                        <Text>Eco-friendly cleaning products</Text>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            }
            sidebar={
              <div className="space-y-6">
                <Card>
                  <CardContent>
                    <Heading level={4} className="mb-4">Provider Info</Heading>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">👤</span>
                      </div>
                      <Text className="font-medium">Clean Pro Services</Text>
                      <Text size="small" className="text-neutral-600">Professional Cleaner</Text>
                      <div className="flex items-center justify-center mt-2">
                        <Badge variant="success" size="sm">Verified</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Heading level={4} className="mb-4">Quick Book</Heading>
                    <div className="space-y-3">
                      <FormInput label="Preferred Date" type="date" />
                      <FormInput label="Preferred Time" type="time" />
                      <Button variant="primary" className="w-full">
                        Quick Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            }
          />
        );

      case 'form':
        return (
          <FormPageTemplate
            title="Add New Service"
            subtitle="Create a new service offering"
            description="Fill out the form below to add a new service to your catalog."
            icon={<span>➕</span>}
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/services' },
              { label: 'Add Service' }
            ]}
            backButton={{
              onClick: () => navigate(-1),
              label: 'Back to Services'
            }}
            form={
              <Card>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Service Title"
                        placeholder="e.g. Professional House Cleaning"
                        required
                      />
                      <FormInput
                        label="Price"
                        type="number"
                        placeholder="120"
                        required
                      />
                    </div>

                    <FormTextarea
                      label="Description"
                      placeholder="Describe your service in detail..."
                      rows={4}
                      maxLength={500}
                      showCharCount
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Category
                        </label>
                        <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                          <option>Select a category</option>
                          <option>Cleaning</option>
                          <option>Plumbing</option>
                          <option>Gardening</option>
                          <option>Electrical</option>
                        </select>
                      </div>
                      <FormInput
                        label="Duration (hours)"
                        type="number"
                        placeholder="2"
                      />
                    </div>

                    <FormActions align="between">
                      <Button variant="ghost" type="button">
                        Save as Draft
                      </Button>
                      <div className="flex space-x-3">
                        <Button variant="outline" type="button">
                          Cancel
                        </Button>
                        <FormSubmitButton>
                          Create Service
                        </FormSubmitButton>
                      </div>
                    </FormActions>
                  </form>
                </CardContent>
              </Card>
            }
            sidebar={
              <div className="space-y-6">
                <Alert variant="info" title="Tips for Success">
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Use clear, descriptive titles</li>
                    <li>• Include all relevant details</li>
                    <li>• Set competitive pricing</li>
                    <li>• Add high-quality images</li>
                  </ul>
                </Alert>

                <Card>
                  <CardContent>
                    <Heading level={4} className="mb-3">Preview</Heading>
                    <Text size="small" className="text-neutral-600">
                      Your service will appear like this to customers.
                    </Text>
                  </CardContent>
                </Card>
              </div>
            }
          />
        );

      case 'empty':
        return (
          <EmptyPageTemplate
            title="No Services Yet"
            subtitle="Start by adding your first service"
            description="Services help customers find exactly what they need. Create your first service to get started."
            icon="🏠"
            primaryAction={
              <Button variant="primary" size="lg" onClick={() => alert('Add Service')}>
                Add Your First Service
              </Button>
            }
            secondaryAction={
              <Button variant="outline" onClick={() => alert('Import Services')}>
                Import from Template
              </Button>
            }
          />
        );

      default:
        return <div>Select a template</div>;
    }
  };

  return (
    <div>
      {/* Template Selector */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Heading level={2}>Layout System Showcase</Heading>
            <div className="flex space-x-2">
              {[
                { key: 'dashboard', label: 'Dashboard' },
                { key: 'list', label: 'List Page' },
                { key: 'detail', label: 'Detail Page' },
                { key: 'form', label: 'Form Page' },
                { key: 'empty', label: 'Empty State' },
              ].map(template => (
                <Button
                  key={template.key}
                  variant={currentTemplate === template.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentTemplate(template.key)}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Template Content */}
      {renderTemplate()}
    </div>
  );
};

// Helper component for stats
const StatCard = ({ title, value, icon }) => (
  <Card>
    <CardContent>
      <div className="flex items-center justify-between">
        <div>
          <Text size="small" className="text-neutral-600 mb-1">
            {title}
          </Text>
          <Text size="large" className="font-bold text-neutral-900">
            {value}
          </Text>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

export default LayoutShowcase; 
import React from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Stack,
  Grid,
  Card,
  CardContent,
  Button,
  Badge,
  Text,
  Heading,
  Display,
  Alert,
  Icon,
  getServiceIcon,
  ServiceCard,
  ActionCard,
  designTokens,
} from '../index';

/**
 * Brand Identity & Visual Hierarchy Showcase
 * 
 * Demonstrates the enhanced HomeCare brand identity with improved
 * visual hierarchy, consistent iconography, and professional aesthetics.
 */
const BrandShowcase = () => {
  const sampleServices = [
    {
      _id: '1',
      title: 'Professional House Cleaning',
      description: 'Comprehensive deep cleaning service using eco-friendly products',
      price: 120,
      category: 'cleaning',
      rating: 4.8,
      providerName: 'CleanPro Services',
    },
    {
      _id: '2',
      title: 'Expert Plumbing Repair',
      description: 'Licensed plumbers for all your home plumbing needs',
      price: 85,
      category: 'plumbing',
      rating: 4.9,
      providerName: 'FlowMaster Plumbing',
    },
    {
      _id: '3',
      title: 'Garden Maintenance',
      description: 'Keep your outdoor space beautiful year-round',
      price: 65,
      category: 'gardening',
      rating: 4.7,
      providerName: 'GreenThumb Landscaping',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section - Enhanced Brand Identity */}
      <section className={designTokens.components.section.hero}>
        <Container>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Display size="large" className="text-white mb-6">
                {designTokens.brand.name}
              </Display>
              <Text size="large" className="text-white/90 mb-8 max-w-2xl mx-auto">
                {designTokens.brand.tagline} - Experience the difference of professional, 
                reliable, and caring home service solutions.
              </Text>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-neutral-50 shadow-lg"
                >
                  <Icon name="services" size="sm" className="mr-2" />
                  Browse Services
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Icon name="calendar" size="sm" className="mr-2" />
                  Book Now
                </Button>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Visual Hierarchy Demonstration */}
      <section className={designTokens.components.section.feature}>
        <Container>
          <div className="text-center mb-16">
            <Heading level={1} className="mb-4">
              Enhanced Visual Hierarchy
            </Heading>
            <Text size="large" className="text-neutral-600 max-w-2xl mx-auto">
              Experience clear contrast, consistent spacing, and professional typography 
              that guides users naturally through your content.
            </Text>
          </div>

          {/* Typography Scale Demo */}
          <Card className="mb-12">
            <CardContent>
              <Heading level={2} className="mb-8 text-center">
                Typography Scale & Contrast
              </Heading>
              
              <div className="space-y-6">
                                 <div className="text-center">
                   <Display size="small" className="mb-2">Display Heading</Display>
                   <Text size="small" className="text-neutral-500">Extra bold, tight tracking for maximum impact</Text>
                 </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Heading level={1} className="mb-2">Primary Heading (H1)</Heading>
                    <Heading level={2} className="mb-2">Secondary Heading (H2)</Heading>
                    <Heading level={3} className="mb-2">Section Heading (H3)</Heading>
                    <Heading level={4} className="mb-2">Subsection (H4)</Heading>
                  </div>
                  
                  <div>
                    <Text size="large" className="mb-2">
                      <strong>Large Body Text</strong> - Perfect for important descriptions
                    </Text>
                    <Text className="mb-2">
                      <strong>Default Body Text</strong> - Standard readable content
                    </Text>
                    <Text size="small" className="mb-2">
                      <strong>Small Text</strong> - For details and metadata
                    </Text>
                    <Text size="tiny">
                      <strong>Tiny Text</strong> - For fine print and labels
                    </Text>
                  </div>
                </div>

                {/* Contrast Demonstration */}
                <div className="bg-neutral-50 p-6 rounded-xl">
                  <Heading level={3} className="mb-4">Contrast Pairings</Heading>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className={designTokens.typography.contrast.title}>
                        Bold Title Text
                      </div>
                      <div className={designTokens.typography.contrast.subtitle}>
                        Medium subtitle for context
                      </div>
                      <div className={designTokens.typography.contrast.description}>
                        Light description text for details
                      </div>
                    </div>
                    <div>
                      <div className={designTokens.typography.contrast.accent}>
                        Accent text for highlights
                      </div>
                      <div className={designTokens.typography.semantic.success}>
                        Success messaging
                      </div>
                      <div className={designTokens.typography.semantic.warning}>
                        Warning notifications
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Icon System Demo */}
          <Card className="mb-12">
            <CardContent>
              <Heading level={2} className="mb-8 text-center">
                Consistent Icon System
              </Heading>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Service Category Icons */}
                <div>
                  <Heading level={4} className="mb-4 text-center">Service Categories</Heading>
                  <div className="grid grid-cols-3 gap-4">
                    {['cleaning', 'plumbing', 'electrical', 'gardening', 'painting', 'moving'].map(category => (
                      <div key={category} className="text-center p-3 bg-neutral-50 rounded-lg">
                        <Icon 
                          name={getServiceIcon(category)} 
                          size="lg" 
                          className="text-primary-600 mx-auto mb-2" 
                        />
                        <Text size="tiny" className="capitalize">{category}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Icons */}
                <div>
                  <Heading level={4} className="mb-4 text-center">Actions</Heading>
                  <div className="grid grid-cols-3 gap-4">
                    {['add', 'edit', 'delete', 'check', 'close', 'calendar'].map(icon => (
                      <div key={icon} className="text-center p-3 bg-neutral-50 rounded-lg">
                        <Icon 
                          name={icon} 
                          size="lg" 
                          className="text-neutral-600 mx-auto mb-2" 
                        />
                        <Text size="tiny" className="capitalize">{icon}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Icons */}
                <div>
                  <Heading level={4} className="mb-4 text-center">Status & Alerts</Heading>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'success', color: 'text-success-600' },
                      { name: 'warning', color: 'text-warning-600' },
                      { name: 'error', color: 'text-error-600' },
                      { name: 'info', color: 'text-primary-600' },
                      { name: 'star', color: 'text-warning-400' },
                      { name: 'clock', color: 'text-neutral-600' },
                    ].map(({ name, color }) => (
                      <div key={name} className="text-center p-3 bg-neutral-50 rounded-lg">
                        <Icon 
                          name={name} 
                          size="lg" 
                          className={`${color} mx-auto mb-2`} 
                        />
                        <Text size="tiny" className="capitalize">{name}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Components */}
          <div className="mb-12">
            <Heading level={2} className="mb-8 text-center">
              Enhanced Component Library
            </Heading>
            
            <Grid cols={2} gap="lg" className="mb-8">
              {/* Enhanced Buttons */}
              <Card>
                <CardContent>
                  <Heading level={4} className="mb-4">Enhanced Buttons</Heading>
                  <Stack spacing="md">
                    <Button variant="primary" className="w-full">
                      <Icon name="add" size="sm" className="mr-2" />
                      Primary with Gradient
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Icon name="services" size="sm" className="mr-2" />
                      Enhanced Outline
                    </Button>
                    <Button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold">
                      <Icon name="star" size="sm" className="mr-2" />
                      Gradient Button
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Enhanced Badges */}
              <Card>
                <CardContent>
                  <Heading level={4} className="mb-4">Enhanced Badges</Heading>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="primary">
                      <Icon name="star" size="xs" className="mr-1" />
                      Popular
                    </Badge>
                    <Badge variant="success">
                      <Icon name="check" size="xs" className="mr-1" />
                      Verified
                    </Badge>
                    <Badge variant="warning">
                      <Icon name="clock" size="xs" className="mr-1" />
                      Pending
                    </Badge>
                    <Badge className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                      <Icon name="star" size="xs" className="mr-1" />
                      Premium
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Enhanced Alert Messages */}
            <Stack spacing="md">
              <Alert variant="info" title="Professional Service" dismissible>
                <div className="flex items-center">
                  <Icon name="info" size="sm" className="mr-2 text-primary-600" />
                  All our service providers are licensed, insured, and background-checked for your peace of mind.
                </div>
              </Alert>
              
              <Alert variant="success" title="Booking Confirmed">
                <div className="flex items-center">
                  <Icon name="check" size="sm" className="mr-2 text-success-600" />
                  Your service has been successfully scheduled. You'll receive a confirmation email shortly.
                </div>
              </Alert>
            </Stack>
          </div>

          {/* Service Cards with Enhanced Design */}
          <div className="mb-12">
            <Heading level={2} className="mb-8 text-center">
              Enhanced Service Cards
            </Heading>
            <Grid cols={3} gap="lg">
              {sampleServices.map((service, index) => (
                <ServiceCard 
                  key={service._id} 
                  service={service} 
                  index={index}
                  className="transform hover:scale-105 transition-transform duration-200"
                />
              ))}
            </Grid>
          </div>

          {/* Brand Personality */}
          <Card className={`${designTokens.gradients.cardElevated} border-primary-200`}>
            <CardContent>
              <div className="text-center">
                <Icon name="home" size="2xl" className="text-primary-600 mx-auto mb-4" />
                <Heading level={2} className="mb-4">
                  {designTokens.brand.name} Personality
                </Heading>
                <Text className="mb-6 max-w-2xl mx-auto">
                  {designTokens.brand.voice.style}
                </Text>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {designTokens.brand.personality.map((trait, index) => (
                    <Badge 
                      key={trait} 
                      variant="primary" 
                      className="justify-center py-2"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>

                <div className="bg-white/50 p-6 rounded-xl">
                  <Heading level={4} className="mb-4">Voice & Tone Guidelines</Heading>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {designTokens.brand.voice.guidelines.map((guideline, index) => (
                      <div key={index} className="flex items-start">
                        <Icon name="check" size="sm" className="text-success-600 mr-2 mt-0.5 flex-shrink-0" />
                        <Text size="small">{guideline}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Gradient Backgrounds Demo */}
      <section className="py-16">
        <Container>
          <Heading level={2} className="mb-8 text-center">
            Brand Gradient System
          </Heading>
          
          <Grid cols={2} gap="lg">
            <div className={`${designTokens.gradients.hero} text-white p-8 rounded-xl`}>
              <Heading level={3} className="text-white mb-4">Hero Gradient</Heading>
              <Text className="text-white/90">
                Perfect for landing sections and call-to-action areas
              </Text>
            </div>
            
            <div className={`${designTokens.gradients.feature} p-8 rounded-xl`}>
              <Heading level={3} className="mb-4">Feature Gradient</Heading>
              <Text className="text-neutral-700">
                Subtle gradient for highlighting important sections
              </Text>
            </div>
          </Grid>
        </Container>
      </section>
    </div>
  );
};

export default BrandShowcase; 
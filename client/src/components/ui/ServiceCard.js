import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Text, Heading, Button, Icon } from './index';

/**
 * Enhanced Service Card Component with Role-Based Actions
 * 
 * @param {Object} service - Service data
 * @param {number} index - Card index for animation delay
 * @param {string} variant - Card style variant
 * @param {boolean} showImage - Whether to show service image
 * @param {Function} onClick - Custom click handler
 * @param {Function} onViewDetails - View details handler
 * @param {Function} onBook - Book service handler (only for customers)
 * @param {Function} onEdit - Edit service handler (only for providers)
 * @param {Function} onContact - Contact provider handler
 * @param {boolean} showActions - Whether to show action buttons
 * @param {string} userRole - Current user role ('customer', 'provider', or null)
 * @param {string} currentUserId - Current user ID (for provider ownership check)
 */
const ServiceCard = ({ 
  service, 
  index = 0, 
  variant = 'default',
  showImage = true,
  onClick,
  onViewDetails,
  onBook,
  onEdit,
  onContact,
  showActions = true,
  userRole = null,
  currentUserId = null,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(service);
    } else if (onViewDetails) {
      onViewDetails(service);
    } else {
      navigate(`/service/${service._id || service.id}`);
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      cleaning: 'cleaning',
      plumbing: 'plumbing',
      electrical: 'electrical',
      gardening: 'gardening',
      painting: 'painting',
      moving: 'moving',
      repair: 'cleaning',
      emergency: 'warning',
    };
    return iconMap[category?.toLowerCase()] || 'services';
  };

  const gradients = [
    'from-primary-100 to-primary-200',
    'from-success-100 to-success-200',
    'from-warning-100 to-warning-200',
    'from-secondary-100 to-secondary-200'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.15 } }}
      className={className}
    >
      <Card 
        hover 
        className="cursor-pointer overflow-hidden h-full group"
        onClick={handleClick}
      >
        {showImage && (
          <div className={`h-40 bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-200"></div>
            {service.image ? (
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform duration-150 relative z-10">
                <Icon name={getCategoryIcon(service.category)} size="2xl" />
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="neutral" className="bg-white/90 text-neutral-800">
                {service.category}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="p-5">
          <Heading 
            level={3} 
            className="text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors duration-150"
          >
            {service.title}
          </Heading>
          
          <Text size="small" className="text-neutral-600 mb-4 line-clamp-2">
            {service.description}
          </Text>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-primary-600">
              ${service.price}
            </span>
            
            {service.rating && (
              <div className="flex items-center space-x-1">
                <Icon name="starFilled" size="sm" className="text-warning-400" />
                <Text size="small" className="text-neutral-600">
                  {service.rating}
                </Text>
              </div>
            )}
          </div>
          
          {service.providerName && (
            <Text size="tiny" className="text-neutral-500 mb-4">
              by {service.providerName}
            </Text>
          )}
          
          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200">
              {/* Always show Details button */}
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(service);
                  }}
                >
                  <Icon name="info" size="xs" className="mr-1" />
                  Details
                </Button>
              )}

              {/* Customer Actions */}
              {userRole === 'customer' && onBook && (
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook(service);
                  }}
                >
                  <Icon name="calendar" size="xs" className="mr-1" />
                  Book Now
                </Button>
              )}

              {/* Provider Actions - Own Service */}
              {userRole === 'provider' && currentUserId === service.providerId && onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(service);
                  }}
                >
                  <Icon name="edit" size="xs" className="mr-1" />
                  Edit
                </Button>
              )}

              {/* Provider Actions - Other's Service */}
              {userRole === 'provider' && currentUserId !== service.providerId && onContact && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact(service);
                  }}
                >
                  <Icon name="chat" size="xs" className="mr-1" />
                  Contact
                </Button>
              )}

              {/* Provider Restriction Notice */}
              {userRole === 'provider' && currentUserId !== service.providerId && !onContact && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 cursor-not-allowed opacity-60"
                  disabled
                >
                  <Icon name="info" size="xs" className="mr-1" />
                  View Only
                </Button>
              )}

              {/* Guest User Actions */}
              {!userRole && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/login');
                  }}
                >
                  <Icon name="user" size="xs" className="mr-1" />
                  Login to Book
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ServiceCard; 
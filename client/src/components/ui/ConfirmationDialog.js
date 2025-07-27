import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Icon, Heading, Text, Card } from './index';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger, warning, info
  icon = null,
  details = null,
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-error-500',
          confirmVariant: 'error',
          bgColor: 'bg-error-50',
          borderColor: 'border-error-200'
        };
      case 'warning':
        return {
          iconColor: 'text-warning-500',
          confirmVariant: 'warning',
          bgColor: 'bg-warning-50',
          borderColor: 'border-warning-200'
        };
      default:
        return {
          iconColor: 'text-primary-500',
          confirmVariant: 'primary',
          bgColor: 'bg-primary-50',
          borderColor: 'border-primary-200'
        };
    }
  };

  const styles = getVariantStyles();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        />
        
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md"
        >
          <Card className={`p-0 overflow-hidden shadow-xl ${styles.borderColor} border-2`}>
            {/* Header */}
            <div className={`px-6 py-4 ${styles.bgColor} border-b ${styles.borderColor}`}>
              <div className="flex items-center space-x-3">
                {icon && (
                  <div className={`flex-shrink-0 ${styles.iconColor}`}>
                    {typeof icon === 'string' ? (
                      <Icon name={icon} size="lg" />
                    ) : (
                      icon
                    )}
                  </div>
                )}
                <Heading level={3} className="text-neutral-900">
                  {title}
                </Heading>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-6 py-6">
              <Text className="text-neutral-700 mb-4 leading-relaxed">
                {message}
              </Text>
              
              {details && (
                <div className="bg-neutral-50 rounded-lg p-4 mb-4 border border-neutral-200">
                  <Text size="small" className="text-neutral-600">
                    {details}
                  </Text>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                variant={styles.confirmVariant}
                onClick={onConfirm}
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Icon name="loading" size="xs" className="animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationDialog; 
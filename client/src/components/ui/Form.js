import React from 'react';
import { Input, Textarea, Button, Text } from './index';

/**
 * Form Container Component
 */
export const Form = ({ children, onSubmit, className = '', ...props }) => (
  <form 
    onSubmit={onSubmit} 
    className={`space-y-6 ${className}`} 
    {...props}
  >
    {children}
  </form>
);

/**
 * Form Field Group Component
 */
export const FormField = ({ children, className = '', ...props }) => (
  <div className={`space-y-2 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Form Section Component (for grouping related fields)
 */
export const FormSection = ({ title, description, children, className = '', ...props }) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {title && (
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        {description && (
          <Text size="small" className="text-neutral-600">
            {description}
          </Text>
        )}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

/**
 * Form Actions Component (for buttons)
 */
export const FormActions = ({ 
  children, 
  align = 'right', 
  className = '', 
  ...props 
}) => {
  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div 
      className={`flex items-center space-x-3 pt-6 border-t border-neutral-200 ${alignments[align]} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Enhanced Input Field with Label and Validation
 */
export const FormInput = ({ 
  label, 
  required = false, 
  error, 
  helper, 
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}) => (
  <FormField>
    {label && (
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
    )}
    
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-neutral-400">{icon}</span>
        </div>
      )}
      
      <Input
        error={error}
        className={`
          ${icon && iconPosition === 'left' ? 'pl-10' : ''}
          ${icon && iconPosition === 'right' ? 'pr-10' : ''}
          ${className}
        `}
        {...props}
      />
      
      {icon && iconPosition === 'right' && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-neutral-400">{icon}</span>
        </div>
      )}
    </div>
    
    {error && (
      <Text size="small" className="text-error-600">
        {error}
      </Text>
    )}
    
    {helper && !error && (
      <Text size="small" className="text-neutral-500">
        {helper}
      </Text>
    )}
  </FormField>
);

/**
 * Enhanced Textarea Field
 */
export const FormTextarea = ({ 
  label, 
  required = false, 
  error, 
  helper,
  rows = 4,
  maxLength,
  showCharCount = false,
  className = '',
  value = '',
  ...props 
}) => (
  <FormField>
    {label && (
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
    )}
    
    <Textarea
      error={error}
      rows={rows}
      maxLength={maxLength}
      value={value}
      className={className}
      {...props}
    />
    
    <div className="flex justify-between items-center">
      <div>
        {error && (
          <Text size="small" className="text-error-600">
            {error}
          </Text>
        )}
        
        {helper && !error && (
          <Text size="small" className="text-neutral-500">
            {helper}
          </Text>
        )}
      </div>
      
      {showCharCount && maxLength && (
        <Text size="tiny" className="text-neutral-400">
          {value.length}/{maxLength}
        </Text>
      )}
    </div>
  </FormField>
);

/**
 * Form Select Field
 */
export const FormSelect = ({ 
  label, 
  required = false, 
  error, 
  helper,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props 
}) => (
  <FormField>
    {label && (
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
    )}
    
    <select
      className={`
        w-full px-3 py-2 border rounded-lg transition-colors duration-200
        ${error 
          ? 'border-error-300 focus:ring-2 focus:ring-error-500 focus:border-error-500' 
          : 'border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
        }
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option, index) => (
        <option 
          key={option.value || index} 
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
    
    {error && (
      <Text size="small" className="text-error-600">
        {error}
      </Text>
    )}
    
    {helper && !error && (
      <Text size="small" className="text-neutral-500">
        {helper}
      </Text>
    )}
  </FormField>
);

/**
 * Form Checkbox Field
 */
export const FormCheckbox = ({ 
  label, 
  description,
  error, 
  className = '',
  ...props 
}) => (
  <FormField>
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          className={`
            h-4 w-4 text-primary-600 focus:ring-primary-500 
            border-neutral-300 rounded transition-colors duration-200
            ${error ? 'border-error-300' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      <div className="ml-3">
        {label && (
          <label className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        
        {description && (
          <Text size="small" className="text-neutral-500">
            {description}
          </Text>
        )}
        
        {error && (
          <Text size="small" className="text-error-600">
            {error}
          </Text>
        )}
      </div>
    </div>
  </FormField>
);

/**
 * Submit Button with Loading State
 */
export const FormSubmitButton = ({ 
  children = 'Submit',
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
  ...props 
}) => (
  <Button
    type="submit"
    variant={variant}
    loading={loading}
    disabled={disabled || loading}
    className={`w-full sm:w-auto ${className}`}
    {...props}
  >
    {children}
  </Button>
);

export default {
  Form,
  FormField,
  FormSection,
  FormActions,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormSubmitButton,
}; 
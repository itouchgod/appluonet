import { useState, useCallback } from 'react';

interface FormState {
  [key: string]: unknown;
}

interface FormErrors {
  [key: string]: string;
}

interface FormOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends FormState>({
  initialValues,
  validate,
  onSubmit
}: FormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleChange = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));

    if (touched[field as string] && validate) {
      const validationErrors = validate({
        ...values,
        [field]: value
      });
      setErrors(prev => ({
        ...prev,
        [field]: validationErrors[field as string]
      }));
    }
  }, [touched, validate, values]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    if (validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({
        ...prev,
        [field]: validationErrors[field as string]
      }));
    }
  }, [validate, values]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validate, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
} 
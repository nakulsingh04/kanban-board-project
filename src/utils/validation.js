import * as yup from 'yup';
import { VALIDATION } from './config.js';

// Task validation schema
export const taskValidationSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Task title is required')
    .max(VALIDATION.title.maxLength, `Task title must be less than ${VALIDATION.title.maxLength} characters`),
  description: yup
    .string()
    .max(VALIDATION.description.maxLength, `Task description must be less than ${VALIDATION.description.maxLength} characters`),
  priority: yup
    .string()
    .oneOf(VALIDATION.priority.levels, 'Invalid priority level')
    .required('Priority is required'),
  columnId: yup
    .string()
    .oneOf(VALIDATION.columns.ids, 'Invalid column')
    .required('Column is required')
});

// Task update schema (for editing existing tasks)
export const taskUpdateSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Task title is required')
    .max(VALIDATION.title.maxLength, `Task title must be less than ${VALIDATION.title.maxLength} characters`),
  description: yup
    .string()
    .max(VALIDATION.description.maxLength, `Task description must be less than ${VALIDATION.description.maxLength} characters`),
  priority: yup
    .string()
    .oneOf(VALIDATION.priority.levels, 'Invalid priority level')
    .required('Priority is required'),
  tags: yup
    .array()
    .of(yup.string().max(VALIDATION.tags.maxLength, `Tag must be less than ${VALIDATION.tags.maxLength} characters`))
    .max(VALIDATION.tags.maxCount, `Maximum ${VALIDATION.tags.maxCount} tags allowed`),
  dueDate: yup
    .date()
    .nullable()
    .min(new Date(), 'Due date cannot be in the past')
});

// Validation helper function
export const validateField = async (schema, fieldName, value, context = {}) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value, ...context });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// Validate entire form
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    }
    return { isValid: false, errors };
  }
};

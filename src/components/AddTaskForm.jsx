'use client';

import { useState, useCallback } from 'react';
import { taskValidationSchema, validateField, validateForm } from '../utils/validation';

export default function AddTaskForm({ onSubmit, onCancel, columnId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    columnId: columnId || 'todo',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = await validateForm(taskValidationSchema, formData);
    
    if (isValid) {
      onSubmit(formData);
      setFormData({ title: '', description: '', priority: 'medium', columnId: columnId || 'todo' });
      setErrors({});
    } else {
      setErrors(validationErrors);
    }
  }, [formData, onSubmit, columnId]);

  const handleChange = useCallback(async (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    
    setFormData(newFormData);
    
    const { isValid, error } = await validateField(taskValidationSchema, name, value, newFormData);
    
    if (isValid) {
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [formData, errors]);

  const handleCancel = useCallback(() => {
    onCancel();
    setFormData({ title: '', description: '', priority: 'medium', columnId: columnId || 'todo' });
    setErrors({});
  }, [onCancel, columnId]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white rounded-lg border border-gray-200 p-4 mt-3"
      aria-label="Add new task form"
    >
      <div className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter task title"
            required
            aria-describedby={errors.title ? 'title-error' : undefined}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter task description"
            aria-describedby={errors.description ? 'description-error' : undefined}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.priority ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            aria-describedby={errors.priority ? 'priority-error' : undefined}
            aria-invalid={!!errors.priority}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && (
            <p id="priority-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.priority}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add task"
          >
            Add Task
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Cancel adding task"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

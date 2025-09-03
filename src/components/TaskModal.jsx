'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { updateTask } from '../store/slices/tasksSlice';
import { updateTaskInColumn } from '../store/slices/boardsSlice';
import { closeTaskModal } from '../store/slices/uiSlice';
import { clearEditingTask } from '../store/slices/tasksSlice';
import { X, Calendar, User, Tag, Edit3, Save } from 'lucide-react';
import { format } from 'date-fns';
import { taskUpdateSchema, validateField, validateForm } from '../utils/validation';

export default function TaskModal() {
  const dispatch = useAppDispatch();
  const { editingTask } = useAppSelector(state => state.tasks);
  const { isTaskModalOpen } = useAppSelector(state => state.ui);

  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    dueDate: '',
    isCompleted: false,
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',

        tags: editingTask.tags || [],
        dueDate: editingTask.dueDate ? format(new Date(editingTask.dueDate), 'yyyy-MM-dd') : '',
        isCompleted: editingTask.isCompleted || false,
      });
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form with Yup
    const { isValid, errors: validationErrors } = await validateForm(taskUpdateSchema, formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const updates = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };
      
      // Optimistic update - update UI immediately
      if (editingTask.columnId) {
        dispatch(updateTaskInColumn({ 
          columnId: editingTask.columnId, 
          taskId: editingTask.id, 
          updates 
        }));
      }
      
      // Then try to update on server
      await dispatch(updateTask({
        taskId: editingTask.id,
        updates
      })).unwrap();
      
      dispatch(closeTaskModal());
      dispatch(clearEditingTask());
      setErrors({});
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert optimistic update on error
      if (editingTask.columnId) {
        dispatch(updateTaskInColumn({ 
          columnId: editingTask.columnId, 
          taskId: editingTask.id, 
          updates: editingTask 
        }));
      }
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    
    setFormData(newFormData);
    
    // Real-time validation with Yup
    const { isValid, error } = await validateField(taskUpdateSchema, name, value, newFormData);
    
    if (isValid) {
      // Clear error if validation passes
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    } else {
      // Set error if validation fails
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isTaskModalOpen || !editingTask) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Edit Task</h3>
          <button
            onClick={() => {
              dispatch(closeTaskModal());
              dispatch(clearEditingTask());
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
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

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          {/* Priority and Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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


          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dueDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
              aria-invalid={!!errors.dueDate}
            />
            {errors.dueDate && (
              <p id="dueDate-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Completion Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCompleted"
              checked={formData.isCompleted}
              onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isCompleted" className="text-sm font-medium text-gray-700">
              Mark as completed
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(closeTaskModal());
                dispatch(clearEditingTask());
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

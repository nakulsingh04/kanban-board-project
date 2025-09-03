'use client';

import { useState, useCallback } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { 
  setSearchTerm, 
  setPriorityFilter, 
 
  setTagFilter, 
  setStatusFilter,
  clearAllFilters 
} from '../store/slices/uiSlice';
import { Search, Filter, X, Calendar, User, Tag } from 'lucide-react';

export default function TaskFilters() {
  const dispatch = useAppDispatch();
  const { 
    searchTerm, 
    priorityFilter, 
 
    tagFilter, 
    statusFilter 
  } = useAppSelector(state => state.ui);

  const { columns } = useAppSelector(state => state.boards);
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Get all unique tags from tasks
  const getAllTags = useCallback(() => {
    const tags = new Set();
    Object.values(columns).forEach(column => {
      column.tasks.forEach(task => {
        if (task.tags) {
          task.tags.forEach(tag => tags.add(tag));
        }
      });
    });
    return Array.from(tags);
  }, [columns]);

  const tags = getAllTags();

  const handleSearchChange = useCallback((value) => {
    dispatch(setSearchTerm(value));
  }, [dispatch]);

  const handlePriorityChange = useCallback((value) => {
    dispatch(setPriorityFilter(value));
  }, [dispatch]);



  const handleTagChange = useCallback((value) => {
    dispatch(setTagFilter(value));
  }, [dispatch]);

  const handleStatusChange = useCallback((value) => {
    dispatch(setStatusFilter(value));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearAllFilters());
  }, [dispatch]);

  const hasActiveFilters = searchTerm || priorityFilter || tagFilter || statusFilter;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            hasActiveFilters 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Assignee Filter */}


            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <select
                value={tagFilter}
                onChange={(e) => handleTagChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => handleSearchChange('')}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {priorityFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Priority: {priorityFilter}
                  <button
                    onClick={() => handlePriorityChange('')}
                    className="ml-1 hover:text-yellow-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {tagFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Tag: {tagFilter}
                  <button
                    onClick={() => handleTagChange('')}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  Status: {statusFilter}
                  <button
                    onClick={() => handleStatusChange('')}
                    className="ml-1 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

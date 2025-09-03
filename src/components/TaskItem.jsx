'use client';

import { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Edit3, User, Calendar, Tag, CheckCircle } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { deleteTask } from '../store/slices/tasksSlice';
import { removeTaskFromColumn } from '../store/slices/boardsSlice';
import { setEditingTask } from '../store/slices/tasksSlice';
import { openTaskModal } from '../store/slices/uiSlice';
import { format } from 'date-fns';

const TaskItem = memo(({ task, columnId }) => {
  const dispatch = useAppDispatch();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task: task,
      columnId: columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    // Optimistic update - remove from UI immediately
    dispatch(removeTaskFromColumn({ columnId, taskId: task.id }));
    // Then try to delete from server
    dispatch(deleteTask(task.id)).unwrap().catch((error) => {
      console.error('Failed to delete task:', error);
      // Revert optimistic update on error
      dispatch({
        type: 'boards/addTaskToColumn',
        payload: { columnId, task }
      });
    });
  }, [dispatch, task.id, columnId, task]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    dispatch(setEditingTask({ ...task, columnId }));
    dispatch(openTaskModal());
  }, [dispatch, task, columnId]);

  const isOverdueTask = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-task-id={task.id}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 ${
        isDragging 
          ? 'opacity-50 scale-105 rotate-2 shadow-xl border-blue-300 bg-blue-50' 
          : 'hover:shadow-lg hover:scale-[1.02] hover:border-gray-300'
      } ${task.isCompleted ? 'opacity-75 bg-gray-50' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}, Priority: ${task.priority}${task.isCompleted ? ', Completed' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEdit(e);
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Drag Handle */}
          <div 
            className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
            {...listeners}
            {...attributes}
          >
            <GripVertical size={16} />
          </div>
          
          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate pr-2">
                {task.title}
              </h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={handleEdit}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Edit task"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Tag size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{task.tags[0]}</span>
                    {task.tags.length > 1 && (
                      <span className="text-xs text-gray-400">+{task.tags.length - 1}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {task.assignedTo && (
                  <div className="flex items-center space-x-1">
                    <User size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Assigned</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} className={`${isOverdueTask ? 'text-red-400' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isOverdueTask ? 'text-red-600' : 'text-gray-500'}`}>
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  </div>
                )}
                {task.isCompleted && (
                  <CheckCircle size={14} className="text-green-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;

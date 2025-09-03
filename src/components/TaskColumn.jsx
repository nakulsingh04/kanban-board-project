'use client';

import { useState, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskItem from './TaskItem';
import AddTaskForm from './AddTaskForm';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { createTask } from '../store/slices/tasksSlice';
import { addTaskToColumn } from '../store/slices/boardsSlice';

const TaskColumn = memo(({ column }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const dispatch = useAppDispatch();
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column: column,
    },
  });

  const handleAddTask = async (taskData) => {
    try {
      await dispatch(createTask({ columnId: column.id, taskData })).unwrap();
      // Don't add optimistic update - let Socket.IO handle the real-time update
      setIsAddingTask(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 min-h-[400px] transition-all duration-200 ${
        isOver 
          ? 'bg-blue-50 border-2 border-blue-300 shadow-lg' 
          : 'border border-gray-200'
      }`}
      data-column-id={column.id}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{column.title}</h3>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      <SortableContext 
        items={column.tasks.map(task => task.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 min-h-[200px]">
          {column.tasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              columnId={column.id}
            />
          ))}
        </div>
      </SortableContext>

      {isAddingTask ? (
        <div className="mt-4">
          <AddTaskForm 
            onSubmit={handleAddTask}
            onCancel={() => setIsAddingTask(false)}
            columnId={column.id}
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="w-full mt-4 p-3 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors duration-200 flex items-center justify-center"
        >
          <span className="text-sm">+ Add Task</span>
        </button>
      )}
    </div>
  );
});

TaskColumn.displayName = 'TaskColumn';

export default TaskColumn;

'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchBoards } from '../store/slices/boardsSlice';
import { socketTaskCreated, socketTaskUpdated, socketTaskDeleted, socketTaskMoved } from '../store/slices/tasksSlice';
import { updateTaskInColumn, removeTaskFromColumn, addTaskToColumn } from '../store/slices/boardsSlice';
import TaskColumn from './TaskColumn';
import TaskFilters from './TaskFilters';
import TaskModal from './TaskModal';
import apiService from '../services/api';
import eventTracker from '../utils/eventTracker';

function TaskBoardContent() {
  const dispatch = useAppDispatch();
  const { columns, status } = useAppSelector(state => state.boards);
  const [activeId, setActiveId] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [activityLog, setActivityLog] = useState([]);

  // Add activity to log
  const addActivity = useCallback((message) => {
    setActivityLog(prev => [
      { id: Date.now(), message, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9) // Keep only last 10 entries
    ]);
  }, []);

  // Fetch boards on component mount
  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  // Socket.IO connection status monitoring
  useEffect(() => {
    const socket = apiService.connectWebSocket();
    
    if (socket) {
      const handleConnect = () => setSocketStatus('connected');
      const handleDisconnect = () => setSocketStatus('disconnected');
      const handleReconnect = () => setSocketStatus('connected');
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('reconnect', handleReconnect);
      
      // Set initial status
      setSocketStatus(socket.connected ? 'connected' : 'disconnected');
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('reconnect', handleReconnect);
      };
    }
  }, []);

  const findTaskById = useCallback((taskId) => {
    for (const column of Object.values(columns)) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  }, [columns]);

  const findColumnByTaskId = useCallback((taskId) => {
    for (const column of Object.values(columns)) {
      if (column.tasks.some(t => t.id === taskId)) {
        return column;
      }
    }
    return null;
  }, [columns]);

  // Socket.IO event handlers for real-time updates
  useEffect(() => {
    // Initialize Socket.IO connection
    apiService.connectWebSocket();

    // Subscribe to real-time task updates
    const unsubscribeTaskCreated = apiService.subscribe('task:created', (payload) => {
      eventTracker.processEvent('task:created', payload, (payload) => {
        const { task } = payload;
        addActivity(`Task "${task.title}" created in ${task.columnId}`);
        
        // Add the task to the appropriate column
        dispatch(addTaskToColumn({ 
          columnId: task.columnId, 
          task: { ...task, id: task._id || task.id }
        }));
        
        // Update tasks slice
        dispatch(socketTaskCreated({ ...task, id: task._id || task.id }));
      });
    });

    const unsubscribeTaskUpdated = apiService.subscribe('task:updated', (payload) => {
      eventTracker.processEvent('task:updated', payload, (payload) => {
        const { task } = payload;
        addActivity(`Task "${task.title}" updated`);
        
        // Update the task in the appropriate column
        dispatch(updateTaskInColumn({ 
          columnId: task.columnId, 
          taskId: task._id || task.id, 
          updates: { ...task, id: task._id || task.id }
        }));
        
        // Update tasks slice
        dispatch(socketTaskUpdated({ ...task, id: task._id || task.id }));
      });
    });

    const unsubscribeTaskDeleted = apiService.subscribe('task:deleted', (payload) => {
      eventTracker.processEvent('task:deleted', payload, (payload) => {
        const { taskId } = payload;
        addActivity(`Task deleted`);
        
        // Remove from all columns to be safe
        dispatch(removeTaskFromColumn({ columnId: 'todo', taskId }));
        dispatch(removeTaskFromColumn({ columnId: 'inProgress', taskId }));
        dispatch(removeTaskFromColumn({ columnId: 'done', taskId }));
        
        // Update tasks slice
        dispatch(socketTaskDeleted(taskId));
      });
    });

    const unsubscribeTaskMoved = apiService.subscribe('task:moved', (payload) => {
      eventTracker.processEvent('task:moved', payload, (payload) => {
        const { taskId, sourceColumnId, destinationColumnId, newIndex, task } = payload;
        addActivity(`Task moved from ${sourceColumnId} to ${destinationColumnId}`);
        
        // Remove from source column
        dispatch(removeTaskFromColumn({ 
          columnId: sourceColumnId, 
          taskId: taskId 
        }));
        
        // Add to destination column at the specified index
        if (task) {
          dispatch(addTaskToColumn({ 
            columnId: destinationColumnId, 
            task: { ...task, columnId: destinationColumnId },
            index: newIndex
          }));
        }
        
        // Update tasks slice
        dispatch(socketTaskMoved({ taskId, sourceColumnId, destinationColumnId, newIndex }));
      });
    });

    // Cleanup on unmount
    return () => {
      unsubscribeTaskCreated();
      unsubscribeTaskUpdated();
      unsubscribeTaskDeleted();
      unsubscribeTaskMoved();
    };
  }, [dispatch, addActivity]); // Removed columns, findTaskById, findColumnByTaskId from dependencies

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, args) => {
        return {
          x: 0,
          y: args.active.rect.current.translated
            ? args.active.rect.current.translated.top
            : 0,
        };
      },
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveId(active.id);
  }, []);

  // Handle drag end - Simplified approach
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!active || !over) {
      return;
    }

    // If dropping on the same element, do nothing
    if (active.id === over.id) {
      return;
    }

    const activeTask = findTaskById(active.id);
    if (!activeTask) {
      return;
    }

    const activeColumn = findColumnByTaskId(active.id);
    if (!activeColumn) {
      return;
    }

    try {
      // Determine the target column and position
      let targetColumnId = activeColumn.id;
      let newIndex = activeColumn.tasks.length;

      // Check if dropping on a column
      if (Object.keys(columns).includes(over.id)) {
        targetColumnId = over.id;
        newIndex = columns[targetColumnId].tasks.length;
      } else {
        // Dropping on another task
        const overTask = findTaskById(over.id);
        if (overTask) {
          const overColumn = findColumnByTaskId(over.id);
          if (overColumn) {
            targetColumnId = overColumn.id;
            newIndex = overColumn.tasks.findIndex(task => task.id === over.id);
          }
        }
      }

      // Don't do anything if dropping in the same position
      if (activeColumn.id === targetColumnId) {
        const currentIndex = activeColumn.tasks.findIndex(task => task.id === active.id);
        if (currentIndex === newIndex) {
          return;
        }
      }

      addActivity(`Moving task to ${targetColumnId}`);

      // Send move request via HTTP API
      await apiService.moveTask({
        taskId: active.id,
        sourceColumnId: activeColumn.id,
        destinationColumnId: targetColumnId,
        newIndex
      });
      
      // The Socket.IO event will handle the real-time update
      
    } catch (error) {
      console.error('❌ Error during drag and drop:', error);
      addActivity(`Error: Failed to move task`);
    }
  }, [columns, findTaskById, findColumnByTaskId, addActivity]);

  // Filter tasks based on UI state
  const { searchTerm, priorityFilter, assigneeFilter, tagFilter, statusFilter } = useAppSelector(state => state.ui);
  
  const filterTasks = useCallback((tasks) => {
    return tasks.filter(task => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) && 
            !task.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Priority filter
      if (priorityFilter && task.priority !== priorityFilter) {
        return false;
      }
      
      // Assignee filter
      if (assigneeFilter && task.assignedTo !== assigneeFilter) {
        return false;
      }
      
      // Tag filter
      if (tagFilter && (!task.tags || !task.tags.includes(tagFilter))) {
        return false;
      }
      
      // Status filter
      if (statusFilter && task.columnId !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [searchTerm, priorityFilter, assigneeFilter, tagFilter, statusFilter]);

  const filteredColumns = Object.fromEntries(
    Object.entries(columns).map(([key, column]) => [
      key,
      { ...column, tasks: filterTasks(column.tasks) }
    ])
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Project Dashboard</h2>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              socketStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{socketStatus === 'connected' ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm">Drag and drop tasks between columns to organize your workflow</p>
      </div>

      {/* Filters */}
      <TaskFilters />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
          role="status"
          aria-label="Loading"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(filteredColumns).map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 transform rotate-2 scale-105 opacity-90 max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {findTaskById(activeId)?.title || 'Task'}
                </h3>
                <span className="text-xs text-blue-600 font-medium">Moving...</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {findTaskById(activeId)?.description || 'Task description'}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <TaskModal />

      {/* Activity Log for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Real-time Activity</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {activityLog.length === 0 ? (
              <p className="text-xs text-gray-500">No activity yet</p>
            ) : (
              activityLog.map((activity) => (
                <div key={activity.id} className="text-xs text-gray-600">
                  <span className="text-gray-400">{activity.timestamp}</span>
                  <span className="ml-2">{activity.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaskBoard() {
  return <TaskBoardContent />;
}

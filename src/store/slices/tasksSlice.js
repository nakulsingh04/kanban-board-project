import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunks
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ columnId, taskData }, { rejectWithValue }) => {
    try {
      const response = await apiService.createTask({
        ...taskData,
        columnId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateTask(taskId, updates);
      return { taskId, updates: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await apiService.deleteTask(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ sourceColumnId, destinationColumnId, taskId, newIndex }, { rejectWithValue }) => {
    try {
      // Use the taskId directly since it's now normalized to 'id'
      await apiService.updateTask(taskId, {
        columnId: destinationColumnId,
        position: newIndex,
      });
      return { sourceColumnId, destinationColumnId, taskId, newIndex };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasks: {},
  selectedTask: null,
  editingTask: null,
  status: 'idle',
  error: null,
  pendingOperations: [],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setEditingTask: (state, action) => {
      state.editingTask = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    clearEditingTask: (state) => {
      state.editingTask = null;
    },
    addPendingOperation: (state, action) => {
      if (!state.pendingOperations.includes(action.payload)) {
        state.pendingOperations.push(action.payload);
      }
    },
    removePendingOperation: (state, action) => {
      state.pendingOperations = state.pendingOperations.filter(id => id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic updates
    optimisticCreateTask: (state, action) => {
      const { columnId, task } = action.payload;
      state.tasks[task.id] = task;
    },
    optimisticUpdateTask: (state, action) => {
      const { taskId, updates } = action.payload;
      if (state.tasks[taskId]) {
        state.tasks[taskId] = { ...state.tasks[taskId], ...updates };
      }
    },
    optimisticDeleteTask: (state, action) => {
      const taskId = action.payload;
      delete state.tasks[taskId];
    },
    optimisticMoveTask: (state, action) => {
      const { sourceColumnId, destinationColumnId, taskId, newIndex } = action.payload;
      // This will be handled by the boards slice
    },
    // Socket.IO event handlers
    socketTaskCreated: (state, action) => {
      const task = action.payload;
      state.tasks[task.id || task._id] = task;
    },
    socketTaskUpdated: (state, action) => {
      const task = action.payload;
      const taskId = task.id || task._id;
      if (state.tasks[taskId]) {
        state.tasks[taskId] = { ...state.tasks[taskId], ...task };
      }
    },
    socketTaskDeleted: (state, action) => {
      const taskId = action.payload;
      delete state.tasks[taskId];
      // Clear editing task if it's the one being deleted
      if (state.editingTask && state.editingTask.id === taskId) {
        state.editingTask = null;
      }
    },
    socketTaskMoved: (state, action) => {
      const { taskId, sourceColumnId, destinationColumnId, newIndex } = action.payload;
      const taskIdKey = taskId.id || taskId;
      if (state.tasks[taskIdKey]) {
        state.tasks[taskIdKey] = { 
          ...state.tasks[taskIdKey], 
          columnId: destinationColumnId 
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state, action) => {
        state.status = 'loading';
        if (!state.pendingOperations.includes(action.meta.requestId)) {
          state.pendingOperations.push(action.meta.requestId);
        }
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingOperations = state.pendingOperations.filter(id => id !== action.meta.requestId);
        // Don't add task here - let Socket.IO handle the real-time update
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.pendingOperations = state.pendingOperations.filter(id => id !== action.meta.requestId);
      })
      // Update Task
      .addCase(updateTask.pending, (state, action) => {
        state.status = 'loading';
        if (!state.pendingOperations.includes(action.meta.requestId)) {
          state.pendingOperations.push(action.meta.requestId);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingOperations = state.pendingOperations.filter(id => id !== action.meta.requestId);
        const { taskId, updates } = action.payload;
        if (state.tasks[taskId]) {
          state.tasks[taskId] = { ...state.tasks[taskId], ...updates };
        }
        // Clear editing task after successful update
        state.editingTask = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.pendingOperations = state.pendingOperations.filter(id => id !== action.meta.requestId);
      })
      // Delete Task
      .addCase(deleteTask.pending, (state, action) => {
        state.status = 'loading';
        if (!state.pendingOperations.includes(action.meta.requestId)) {
          state.pendingOperations.push(action.meta.requestId);
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingOperations = state.pendingOperations.filter(id => id !== action.meta.requestId);
        const deletedTaskId = action.payload;
        delete state.tasks[deletedTaskId];
        // Clear editing task if it's the one being deleted
        if (state.editingTask && state.editingTask.id === deletedTaskId) {
          state.editingTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.pendingOperations = state.pendingOperations.filter(id => id !== action.meta.requestId);
      })
      // Move Task
      .addCase(moveTask.pending, (state, action) => {
        state.status = 'loading';
        if (!state.pendingOperations.includes(action.meta.requestId)) {
          state.pendingOperations.push(action.meta.requestId);
        }
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingOperations = state.pendingOperations.filter(id => id !== action.meta.requestId);
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.pendingOperations = state.pendingOperations.filter(id => id !== action.meta.requestId);
      });

    // Socket.IO event handlers
    builder
      .addCase(socketTaskCreated, (state, action) => {
        const task = action.payload;
        const existingTaskIndex = state.tasks.findIndex(t => t.id === task.id);
        if (existingTaskIndex === -1) {
          state.tasks.push(task);
        }
      })
      .addCase(socketTaskUpdated, (state, action) => {
        const task = action.payload;
        const taskIndex = state.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...task };
        }
      })
      .addCase(socketTaskDeleted, (state, action) => {
        const taskId = action.payload;
        state.tasks = state.tasks.filter(task => task.id !== taskId);
      })
      .addCase(socketTaskMoved, (state, action) => {
        const { taskId, sourceColumnId, destinationColumnId, newIndex } = action.payload;
        const taskIndex = state.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = { 
            ...state.tasks[taskIndex], 
            columnId: destinationColumnId 
          };
        }
      });
  },
});

export const {
  setSelectedTask,
  setEditingTask,
  clearSelectedTask,
  clearEditingTask,
  addPendingOperation,
  removePendingOperation,
  clearError,
  optimisticCreateTask,
  optimisticUpdateTask,
  optimisticDeleteTask,
  optimisticMoveTask,
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskDeleted,
  socketTaskMoved,
} = tasksSlice.actions;

export default tasksSlice.reducer;

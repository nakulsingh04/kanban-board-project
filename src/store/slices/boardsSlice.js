import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { COLUMNS, config } from '../../utils/config.js';

// Async thunks
export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getTasks();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await apiService.createBoard(boardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  columns: {
    todo: {
      id: COLUMNS.todo.id,
      title: COLUMNS.todo.title,
      tasks: [],
    },
    inProgress: {
      id: COLUMNS.inProgress.id,
      title: COLUMNS.inProgress.title,
      tasks: [],
    },
    done: {
      id: COLUMNS.done.id,
      title: COLUMNS.done.title,
      tasks: [],
    },
  },
  currentBoard: config.board.defaultId,
  boards: [],
  status: 'idle',
  error: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setColumns: (state, action) => {
      state.columns = action.payload;
    },
    addTaskToColumn: (state, action) => {
      const { columnId, task, index } = action.payload;
      if (state.columns[columnId]) {
        // Ensure task has proper id field
        const taskWithId = { ...task, id: task.id || task._id };
        
        // Check if task already exists in this column
        const existingTaskIndex = state.columns[columnId].tasks.findIndex(
          existingTask => existingTask.id === taskWithId.id
        );
        
        if (existingTaskIndex !== -1) {
          // Task already exists, update it instead of adding
          state.columns[columnId].tasks[existingTaskIndex] = {
            ...state.columns[columnId].tasks[existingTaskIndex],
            ...taskWithId
          };
        } else {
          // Task doesn't exist, add it
          if (typeof index === 'number') {
            // Insert at specific index
            state.columns[columnId].tasks.splice(index, 0, taskWithId);
          } else {
            // Add to end
            state.columns[columnId].tasks.push(taskWithId);
          }
        }
      }
    },
    removeTaskFromColumn: (state, action) => {
      const { columnId, taskId } = action.payload;
      if (state.columns[columnId]) {
        state.columns[columnId].tasks = state.columns[columnId].tasks.filter(
          task => task.id !== taskId
        );
      }
    },
    moveTask: (state, action) => {
      const { sourceColumnId, destinationColumnId, taskId, newIndex } = action.payload;
      
      // Find the task in source column
      const sourceColumn = state.columns[sourceColumnId];
      const destinationColumn = state.columns[destinationColumnId];
      
      if (sourceColumn && destinationColumn) {
        const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          const task = sourceColumn.tasks[taskIndex];
          
          // Remove from source
          sourceColumn.tasks.splice(taskIndex, 1);
          
          // Add to destination
          destinationColumn.tasks.splice(newIndex, 0, task);
          
          // Update the task's columnId
          task.columnId = destinationColumnId;
        }
      }
    },
    updateTaskInColumn: (state, action) => {
      const { columnId, taskId, updates } = action.payload;
      if (state.columns[columnId]) {
        const taskIndex = state.columns[columnId].tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          state.columns[columnId].tasks[taskIndex] = {
            ...state.columns[columnId].tasks[taskIndex],
            ...updates,
          };
        }
      }
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.columns = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      });
  },
});

export const {
  setColumns,
  addTaskToColumn,
  removeTaskFromColumn,
  moveTask,
  updateTaskInColumn,
  setCurrentBoard,
  clearError,
} = boardsSlice.actions;

export default boardsSlice.reducer;

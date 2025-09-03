import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './slices/boardsSlice';
import tasksReducer from './slices/tasksSlice';

import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
    tasks: tasksReducer,

    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['tasks.pendingOperations'],
      },
    }),
});

// Type definitions for TypeScript support
export const RootState = store.getState;
export const AppDispatch = store.dispatch;

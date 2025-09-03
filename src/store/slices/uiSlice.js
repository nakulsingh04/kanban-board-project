import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Search and filtering
  searchTerm: '',
  priorityFilter: '',

  tagFilter: '',
  statusFilter: '',
  
  // UI state
  isSidebarOpen: false,
  isTaskModalOpen: false,
  isUserModalOpen: false,
  isFilterModalOpen: false,
  
  // Notifications
  notifications: [],
  
  // Loading states
  isLoading: false,
  loadingMessage: '',
  
  // Theme and preferences
  theme: 'light',
  compactMode: false,
  showCompletedTasks: true,
  
  // Drag and drop state
  isDragging: false,
  dragOverColumn: null,
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Search and filtering
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setPriorityFilter: (state, action) => {
      state.priorityFilter = action.payload;
    },

    setTagFilter: (state, action) => {
      state.tagFilter = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    clearAllFilters: (state) => {
      state.searchTerm = '';
      state.priorityFilter = '';

      state.tagFilter = '';
      state.statusFilter = '';
    },
    
    // Modal controls
    openTaskModal: (state) => {
      state.isTaskModalOpen = true;
    },
    closeTaskModal: (state) => {
      state.isTaskModalOpen = false;
    },

    openUserModal: (state) => {
      state.isUserModalOpen = true;
    },
    closeUserModal: (state) => {
      state.isUserModalOpen = false;
    },
    openFilterModal: (state) => {
      state.isFilterModalOpen = true;
    },
    closeFilterModal: (state) => {
      state.isFilterModalOpen = false;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading states
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setLoadingMessage: (state, action) => {
      state.loadingMessage = action.payload;
    },
    
    // Theme and preferences
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleCompactMode: (state) => {
      state.compactMode = !state.compactMode;
    },
    toggleShowCompletedTasks: (state) => {
      state.showCompletedTasks = !state.showCompletedTasks;
    },
    
    // Drag and drop state
    setDragging: (state, action) => {
      state.isDragging = action.payload;
    },
    setDragOverColumn: (state, action) => {
      state.dragOverColumn = action.payload;
    },
    
    // Keyboard shortcuts
    toggleKeyboardShortcuts: (state) => {
      state.keyboardShortcutsEnabled = !state.keyboardShortcutsEnabled;
    },
  },
});

export const {
  setSearchTerm,
  setPriorityFilter,

  setTagFilter,
  setStatusFilter,
  clearAllFilters,
  openTaskModal,
  closeTaskModal,
  openUserModal,
  closeUserModal,
  openFilterModal,
  closeFilterModal,
  toggleSidebar,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  setLoadingMessage,
  setTheme,
  toggleCompactMode,
  toggleShowCompletedTasks,
  setDragging,
  setDragOverColumn,
  toggleKeyboardShortcuts,
} = uiSlice.actions;

export default uiSlice.reducer;

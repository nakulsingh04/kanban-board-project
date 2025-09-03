export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  },

  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Task Management System',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  board: {
    defaultId: process.env.NEXT_PUBLIC_DEFAULT_BOARD_ID || 'default',
    columnIds: (process.env.NEXT_PUBLIC_COLUMN_IDS || 'todo,inProgress,done').split(','),
  },

  features: {
    realTime: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
    dragDrop: process.env.NEXT_PUBLIC_ENABLE_DRAG_DROP === 'true',
    filters: process.env.NEXT_PUBLIC_ENABLE_FILTERS === 'true',
  },

  ui: {
    maxTitleLength: parseInt(process.env.NEXT_PUBLIC_MAX_TITLE_LENGTH) || 100,
    maxDescriptionLength: parseInt(process.env.NEXT_PUBLIC_MAX_DESCRIPTION_LENGTH) || 500,
    maxTags: parseInt(process.env.NEXT_PUBLIC_MAX_TAGS) || 5,
    maxTagLength: parseInt(process.env.NEXT_PUBLIC_MAX_TAG_LENGTH) || 20,
  },

  priorities: (process.env.NEXT_PUBLIC_PRIORITY_LEVELS || 'low,medium,high').split(','),
};

export const COLUMNS = {
  todo: {
    id: 'todo',
    title: 'To Do',
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
  },
  done: {
    id: 'done',
    title: 'Done',
  },
};

export const VALIDATION = {
  title: {
    maxLength: config.ui.maxTitleLength,
    required: true,
  },
  description: {
    maxLength: config.ui.maxDescriptionLength,
    required: false,
  },
  tags: {
    maxCount: config.ui.maxTags,
    maxLength: config.ui.maxTagLength,
  },
  priority: {
    levels: config.priorities,
  },
  columns: {
    ids: config.board.columnIds,
  },
};

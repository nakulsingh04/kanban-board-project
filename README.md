# Task Management System

A powerful, real-time task management system built with Next.js, Redux Toolkit, and Socket.io. Features drag-and-drop functionality, user assignments, advanced filtering, and optimistic UI updates.

## 🚀 Features Implemented

### ✅ Core Functionality
- **Real-time Task Management**: Create, edit, delete, and move tasks with instant updates
- **Drag & Drop Interface**: Smooth drag-and-drop between columns with visual feedback
- **Optimistic UI**: Immediate visual feedback with automatic rollback on errors
- **Real-time Collaboration**: WebSocket integration for live updates across all users

### ✅ User Management System
- **User Assignment**: Assign tasks to team members with avatar display
- **User Management Interface**: Add, edit, and manage team members
- **Visual User Indicators**: Color-coded avatars and user status indicators

### ✅ Advanced Filtering & Search
- **Global Search**: Search across task titles and descriptions
- **Multi-filter System**: Filter by priority, assignee, tags, and status
- **Combined Filters**: Use multiple filters simultaneously
- **Persistent Filter Settings**: Filters persist across browser sessions
- **Active Filter Display**: Visual indicators of active filters with easy removal

### ✅ Enhanced Task Features
- **Task Editing**: Comprehensive task editing modal with all fields
- **Due Dates**: Set and track task due dates with overdue indicators
- **Tags System**: Add and manage task tags for better organization
- **Priority Levels**: High, medium, low priority with color coding
- **Completion Tracking**: Mark tasks as completed with visual indicators
- **Rich Task Display**: Show assignees, due dates, tags, and completion status

### ✅ State Management
- **Redux Toolkit**: Centralized state management with proper slices
- **Optimistic Updates**: UI updates immediately with server synchronization
- **Error Handling**: Comprehensive error handling with user notifications
- **Loading States**: Proper loading indicators for all async operations

### ✅ Performance Optimizations
- **React.memo**: Component memoization to prevent unnecessary re-renders
- **useCallback**: Optimized event handlers and functions
- **Code Splitting**: Lazy loading for better initial load times
- **Bundle Optimization**: Tree shaking and efficient imports

### ✅ Accessibility (a11y)
- **ARIA Labels**: Proper accessibility labels throughout the interface
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Semantic HTML and proper ARIA attributes
- **Focus Management**: Proper focus handling and keyboard shortcuts
- **High Contrast**: Accessible color schemes and contrast ratios



## 🏗️ Architecture Overview

### State Management
The application uses Redux Toolkit with the following slices:

- **boardsSlice**: Manages board data and column operations
- **tasksSlice**: Handles task CRUD operations and optimistic updates
- **usersSlice**: Manages user data and assignments
- **uiSlice**: Controls UI state, filters, and notifications

### Real-time Updates
Implemented using WebSockets (Socket.io):

1. User actions trigger immediate UI updates (optimistic)
2. Changes are sent to server via WebSocket
3. Server broadcasts changes to all connected clients
4. Clients update their local state to reflect changes
5. Failed operations trigger automatic rollback

### Drag-and-Drop
Built with `@dnd-kit`:

- Tasks can be dragged between columns
- Visual feedback during drag operations
- Automatic state updates on drop
- Seamless integration with real-time updates

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **Redux Toolkit**: State management
- **@dnd-kit**: Drag and drop functionality
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **date-fns**: Date manipulation

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **Socket.io**: Real-time communication
- **Joi**: Data validation



## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance

### Frontend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your MongoDB URI and other settings

# Start the server
npm run dev
```

### Environment Variables
```env
# Frontend (.env)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/task-management
PORT=3001
CORS_ORIGIN=http://localhost:3000
```





## 🚀 Usage Guide

### Creating Tasks
1. Click "Add Task" in any column
2. Fill in title, description, priority, and assignee
3. Add tags and due date (optional)
4. Click "Add Task" to create

### Managing Tasks
- **Edit**: Click the edit icon on any task
- **Delete**: Click the trash icon to remove a task
- **Move**: Drag and drop tasks between columns
- **Complete**: Check the completion checkbox in edit mode

### Filtering Tasks
1. Use the search bar to find tasks by title/description
2. Click "Filters" to expand filter options
3. Select filters for priority, assignee, tags, or status
4. Use multiple filters simultaneously
5. Click "Clear" to reset all filters

### User Management
1. Navigate to the User Management section
2. Click "Add Member" to create new team members
3. Assign users to tasks in the task creation/edit modal
4. View user assignments on task cards

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── store/              # Redux store
│   └── slices/         # Redux slices
├── hooks/              # Custom React hooks
├── services/           # API and WebSocket services
├── providers/          # Context providers
└── utils/              # Utility functions
```

### Key Components
- **TaskBoard**: Main board component with drag-and-drop
- **TaskItem**: Individual task card with all features
- **TaskFilters**: Advanced filtering and search
- **TaskModal**: Comprehensive task editing
- **UserManagement**: Team member management

### Performance Features
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Code splitting for better performance
- **Optimistic Updates**: Immediate UI feedback
- **Efficient Re-renders**: Proper dependency arrays

## 🎯 Future Enhancements

### Planned Features
- **File Attachments**: Upload and manage files on tasks
- **Time Tracking**: Track time spent on tasks
- **Reporting**: Analytics and progress reports
- **Mobile App**: React Native mobile application
- **Advanced Permissions**: Role-based access control
- **Templates**: Pre-defined task templates
- **Integrations**: Third-party service integrations

### Performance Improvements
- **Virtual Scrolling**: For large task lists
- **Service Worker**: Offline functionality
- **Image Optimization**: Better image handling
- **Caching Strategy**: Advanced caching mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the new functionality
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation


---

**Built with ❤️ using modern web technologies for optimal performance and user experience.**

'use client';

import TaskBoard from '../../components/TaskBoard';

function TaskManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">T</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                  <p className="text-sm text-gray-500">Organize and track your team's work</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/'}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back to Store
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Live</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TaskBoard />
        </main>
      </div>
  );
}

export default TaskManagementPage;

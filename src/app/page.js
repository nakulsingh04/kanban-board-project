import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center rounded-lg m-4">
        <div className="text-2xl font-bold text-blue-600">TaskManager</div>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/tasks"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Tasks
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Live</span>
            </li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Task Management System</h1>
          <Link 
            href="/tasks" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Tasks
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Your Task Management Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Organize and track your team&apos;s work with our powerful task management system. 
            Create, move, and manage tasks in real-time with drag-and-drop functionality.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <h3 className="font-semibold mb-2">Create Tasks</h3>
              <p className="text-sm text-gray-600">Add new tasks with titles, descriptions, and priorities</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">🔄</span>
              </div>
              <h3 className="font-semibold mb-2">Drag & Drop</h3>
              <p className="text-sm text-gray-600">Move tasks between columns with smooth drag-and-drop</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-600">See changes instantly across all connected users</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

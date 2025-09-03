// app/layout.js
import './globals.css';
import ReduxProvider from '../providers/ReduxProvider';

export const metadata = {
  title: 'Task Management System',
  description: 'A powerful task management system with real-time collaboration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}

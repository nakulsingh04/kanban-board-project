import { io } from 'socket.io-client';
import { config } from '../utils/config.js';

const API_BASE_URL = config.api.baseUrl;
const WS_URL = config.api.wsUrl;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.socket = null;
    this.listeners = new Map();
  }

  // Initialize Socket.io connection
  connectWebSocket() {
    if (this.socket) {
      return this.socket;
    }

    try {
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 5000,
      });

      this.socket.on('connect', () => {

        this.socket.emit('join:board', config.board.defaultId);
      });

      this.socket.on('disconnect', () => {

      });

      this.socket.on('connect_error', (error) => {

      });

      this.socket.on('reconnect', (attemptNumber) => {
        this.socket.emit('join:board', config.board.defaultId);
      });

      return this.socket;
    } catch (error) {
      return null;
    }
  }

  handleSocketMessage(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
        }
      });
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
      if (this.socket) {
        this.socket.on(event, (data) => {
          this.handleSocketMessage(event, data);
        });
      }
    }
    this.listeners.get(event).push(callback);

    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      if (callbacks.length === 0 && this.socket) {
        this.socket.off(event);
        this.listeners.delete(event);
      }
    };
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // CRUD Task API methods
  async getTasks() {
    try {
      const response = await this.request('/tasks');
      
      if (response.data) {
        Object.keys(response.data).forEach(columnKey => {
          if (response.data[columnKey].tasks) {
            response.data[columnKey].tasks = response.data[columnKey].tasks.map(task => ({
              ...task,
              id: task._id || task.id,
            }));
          }
        });
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return {
        statusCode: 200,
        data: {
          todo: {
            id: 'todo',
            title: 'To Do',
            tasks: [],
          },
          inProgress: {
            id: 'inProgress',
            title: 'In Progress',
            tasks: [],
          },
          done: {
            id: 'done',
            title: 'Done',
            tasks: [],
          },
        },
      };
    }
  }

  async getTaskById(taskId) {
    try {
      return await this.request(`/tasks/${taskId}`);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const { id, ...serverTaskData } = taskData;
      
      const result = await this.request('/tasks', {
        method: 'POST',
        body: JSON.stringify(serverTaskData),
      });

      if (result.data) {
        result.data = {
          ...result.data,
          id: result.data._id || result.data.id,
        };
      }

      return result;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  async updateTask(taskId, updates) {
    try {
      const result = await this.request(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (result.data) {
        result.data = {
          ...result.data,
          id: result.data._id || result.data.id,
        };
      }

      return result;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const result = await this.request(`/tasks/${taskId}`, {
        method: 'DELETE',
      });

      return result;
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }

    async moveTask(moveData) {
    try {
      const result = await this.request('/tasks/move', {
        method: 'PATCH',
        body: JSON.stringify(moveData),
      });

      this.emit('task:move', {
        ...moveData,
        boardId: config.board.defaultId
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUsers() {
    try {
      return await this.request('/users');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return {
        statusCode: 200,
        data: [
          { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
          { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
        ],
      };
    }
  }





  async createBoard(boardData) {
    try {
      const result = await this.request('/boards', {
        method: 'POST',
        body: JSON.stringify(boardData),
      });
      return result;
    } catch (error) {
      console.error('Failed to create board:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      return await this.request('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const apiService = new ApiService();

export default apiService;

import Task from '../models/Task.js';
import { apiResponse, apiErrorResponse } from '../utils/responseHelper.js';
import { findByIdOrFail, createDocument, updateDocument, deleteDocument } from '../utils/databaseHelper.js';
import { taskEvents } from '../utils/socketHelper.js';
import { seedDatabase, clearDatabase } from '../data/seedData.js';

/**
 * Get all tasks organized by columns
 */
export const getAllTasks = async (req, res) => {
  const columns = {
    todo: {
      id: 'todo',
      title: 'To Do',
      tasks: await Task.getTasksByColumn('todo')
    },
    inProgress: {
      id: 'inProgress',
      title: 'In Progress',
      tasks: await Task.getTasksByColumn('inProgress')
    },
    done: {
      id: 'done',
      title: 'Done',
      tasks: await Task.getTasksByColumn('done')
    }
  };

  return apiResponse({ 
    res, 
    data: columns, 
    statusCode: 200, 
    message: "Tasks retrieved successfully" 
  });
};



/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  const taskData = {
    ...req.body,
    createdBy: req.user?._id || null // Will be null for now, add auth later
  };

  const task = await createDocument(Task, taskData);
  
  // Emit real-time update
  taskEvents.created(req, task);
  
  return apiResponse({ 
    res, 
    data: task, 
    statusCode: 201, 
    message: "Task created successfully" 
  });
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (req, res) => {
  const task = await findByIdOrFail(Task, req.params.id, 'Task');
  
  return apiResponse({ 
    res, 
    data: task, 
    statusCode: 200, 
    message: "Task retrieved successfully" 
  });
};

/**
 * Update a task
 */
export const updateTask = async (req, res) => {
  const task = await updateDocument(Task, req.params.id, req.body);
  
  // Emit real-time update
  taskEvents.updated(req, task);
  
  return apiResponse({ 
    res, 
    data: task, 
    statusCode: 200, 
    message: "Task updated successfully" 
  });
};

/**
 * Delete a task
 */
export const deleteTask = async (req, res) => {
  const task = await deleteDocument(Task, req.params.id);
  
  // Emit real-time update
  taskEvents.deleted(req, req.params.id);
  
  return apiResponse({ 
    res, 
    data: null, 
    statusCode: 200, 
    message: "Task deleted successfully" 
  });
};

/**
 * Move a task between columns or reorder within a column
 */
export const moveTask = async (req, res) => {
  const { taskId, sourceColumnId, destinationColumnId, newIndex } = req.body;
  
  try {
    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return apiErrorResponse({ 
        res, 
        message: "Task not found", 
        statusCode: 404 
      });
    }

    // Update the task's column and position
    task.columnId = destinationColumnId;
    task.position = newIndex;
    await task.save();

    // Update positions of other tasks to maintain proper order
    if (sourceColumnId === destinationColumnId) {
      // Moving within the same column - reorder
      const otherTasks = await Task.find({ 
        columnId: destinationColumnId, 
        _id: { $ne: taskId } 
      }).sort({ position: 1 });
      
      // Recalculate positions
      let currentPosition = 0;
      for (const otherTask of otherTasks) {
        if (currentPosition >= newIndex) {
          currentPosition++;
        }
        otherTask.position = currentPosition;
        await otherTask.save();
        currentPosition++;
      }
    } else {
      // Moving between columns
      // Update source column positions
      const sourceTasks = await Task.find({ columnId: sourceColumnId }).sort({ position: 1 });
      for (let i = 0; i < sourceTasks.length; i++) {
        sourceTasks[i].position = i;
        await sourceTasks[i].save();
      }
      
      // Update destination column positions
      const destinationTasks = await Task.find({ 
        columnId: destinationColumnId,
        _id: { $ne: taskId }
      }).sort({ position: 1 });
      
      // Insert the moved task at the correct position
      const updatedDestinationTasks = [...destinationTasks];
      updatedDestinationTasks.splice(newIndex, 0, task);
      
      // Update positions for all tasks in destination column
      for (let i = 0; i < updatedDestinationTasks.length; i++) {
        updatedDestinationTasks[i].position = i;
        await updatedDestinationTasks[i].save();
      }
    }



    // Emit real-time update to all clients
    taskEvents.moved(req, { 
      taskId, 
      sourceColumnId, 
      destinationColumnId, 
      newIndex,
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        columnId: task.columnId,
        position: task.position,
        assignedTo: task.assignedTo,
        tags: task.tags,
        dueDate: task.dueDate,
        isCompleted: task.isCompleted
      }
    });
    
    return apiResponse({ 
      res, 
      data: {
        task: {
          id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          columnId: task.columnId,
          position: task.position,
          assignedTo: task.assignedTo,
          tags: task.tags,
          dueDate: task.dueDate,
          isCompleted: task.isCompleted
        },
        message: "Task moved successfully"
      }, 
      statusCode: 200, 
      message: "Task moved successfully" 
    });
  } catch (error) {
    return apiErrorResponse({ 
      res, 
      message: "Failed to move task", 
      statusCode: 500 
    });
  }
};

/**
 * Seed database with sample data (Development only)
 */
export const seedDatabaseController = async (req, res) => {
  const result = await seedDatabase();

  // Emit real-time update for new tasks
  taskEvents.seeded(req, result);
  
  return apiResponse({ 
    res, 
    data: result, 
    statusCode: 201, 
    message: "Database seeded successfully" 
  });
};

/**
 * Clear database (Development only)
 */
export const clearDatabaseController = async (req, res) => {
  await clearDatabase();

  // Emit real-time update
  taskEvents.cleared(req);
  
  return apiResponse({ 
    res, 
    data: null, 
    statusCode: 200, 
    message: "Database cleared successfully" 
  });
};









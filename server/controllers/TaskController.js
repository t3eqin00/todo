import { insertTask, selectAllTasks } from "../models/Task.js";
import { emptyOrRows } from "../helper/utils.js";

import { deleteTask } from "../models/Task.js";

const getTasks = async (req, res, next) => {
  try {
    const result = await selectAllTasks();
    return res.status(200).json(emptyOrRows(result));
  } catch (error) {
    return next(error);
  }
};

const postTask = async (req, res, next) => {
    try {
      if (!req.body.description || req.body.description.length === 0) {
        const error = new Error("Invalid Description for task");
        error.statusCode = 400;
        return next(error);
      }
      const description = req.body.description;
      const result = await insertTask(description);
      const id = result.rows[0].id;
      
      // Include both id and description in the response to match test expectations
      return res.status(200).json({ id, description });
    } catch (error) {
      return next(error);
    }
  };
  

  const taskDelete = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
  
      // Check if the id is a valid integer and greater than 0
      if (isNaN(id) || id <= 0) {
        const error = new Error("Invalid Id");
        error.statusCode = 400;
        return next(error);
      }
  
      const result = await deleteTask(id);
  
      // If no rows are affected, task does not exist
      if (result.rowCount === 0) {
        const error = new Error("Task not found");
        error.statusCode = 404;
        return next(error);
      }
  
      return res.status(200).json({ id: id });
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  };
  

export { getTasks, postTask, taskDelete };
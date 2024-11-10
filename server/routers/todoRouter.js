import { Router } from "express";
import {
  getTasks,
  postTask,
  taskDelete,
} from "../controllers/TaskController.js";

const router = Router();

// Router passes requests to the controller
router.get("/", getTasks);

router.post("/create", postTask);

router.delete("/delete/:id", taskDelete);

export default router;
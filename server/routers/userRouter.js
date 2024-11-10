import { Router } from "express";

import { postLogin, postRegistration } from "../controllers/userController.js";

const router = Router();

router.post("/register", postRegistration);
router.post("/login", postLogin);

export default router;
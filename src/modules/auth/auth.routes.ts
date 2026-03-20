import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { uploadAvatar } from "../../middlewares/upload.middleware.js";
import { login, me, register } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", uploadAvatar, register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);

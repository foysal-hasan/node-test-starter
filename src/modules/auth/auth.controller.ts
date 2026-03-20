import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { ApiError } from "../../utils/api-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";
import { loginSchema, registerSchema } from "./validator/index.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);
  const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
  const result = await registerUser(payload, avatar);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const result = await loginUser(payload);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const me = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.sub) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await getCurrentUser(req.user.sub);

    res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: user,
    });
  }
);

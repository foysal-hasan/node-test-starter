import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import multer from "multer";
import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/api-error.js";

const avatarsDirectory = path.resolve("uploads", "avatars");

fs.mkdirSync(avatarsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "Avatar must be an image file"));
      return;
    }

    cb(null, true);
  },
});

export const uploadAvatar = (req: Request, res: Response, next: NextFunction) => {
  upload.single("avatar")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new ApiError(400, "Avatar size must be 5MB or less"));
      return;
    }

    next(error);
  });
};

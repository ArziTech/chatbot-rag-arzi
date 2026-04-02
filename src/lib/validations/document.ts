import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string(),
  fileSize: z.number().max(MAX_FILE_SIZE),
});

export const documentListSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export function validateFileType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

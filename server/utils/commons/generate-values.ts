import { randomBytes } from "node:crypto";

export const getLocaleTime = () => new Date().toLocaleString("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
});

export const generateRequestId = () => randomBytes(3).toString("hex").slice(0, 6).toUpperCase();
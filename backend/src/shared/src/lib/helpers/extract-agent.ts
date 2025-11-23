import { Request } from "express";
import { HttpException } from "../exceptions";

export function extractUserAgent(req: Request) {
  const ip = req.ip;
  const userAgent = req.headers["user-agent"]?.slice(0, 255);
  if (!ip) throw new HttpException(400, "ip unavailable");
  return { ip, userAgent };
}

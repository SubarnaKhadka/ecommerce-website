import { Request, Response } from "express";
import createUser from "../services/user.service";

export const registerUser = async (req: Request, res: Response) => {
  await createUser();
  res.send({ message: "Register user" });
};

export const loginUser = (req: Request, res: Response) => {
  res.send("Login user");
};

import { Router } from "express";
import { get } from "mongoose";
import { getUsers, getUser } from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

//GET /user - Obtener todos los usuarios
//GET /user/:id - Obtener un usuario por su ID

userRouter.get("/", getUsers);

userRouter.get("/:id", authorize, getUser);

userRouter.post("/", (req, res) => res.send( {title: 'Create user'} ));

userRouter.put("/:id", (req, res) => res.send( {title: 'Update user by id'} ));

userRouter.delete("/:id", (req, res) => res.send( {title: 'Delete user by id'} ));

export default userRouter;
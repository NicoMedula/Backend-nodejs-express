import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


import User from "../models/user.model.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

// que es un req.body? --> Es un objeto que contiene los datos enviados por el cliente en una solicitud HTTP POST o PUT. 
// Por ejemplo, si un cliente envía un formulario de registro con campos como "username" y "password",
//  esos datos estarán disponibles en req.body.username y req.body.password respectivamente.


export const signUp = async (req, res,next) => {
  // Lógica para registrar un nuevo usuario
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;
    
    //check si existe el usuario
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      const error = new Error("User already exists");
        error.status = 409;
        throw error;

    }

    //hash con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    //crear el usuario
    const newUser = await User.create([{
      name,
      email,
      password: hashedPassword,
    }], { session });

    //token con jwt
    const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN});



    await session.commitTransaction();

    session.endSession();

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            token,
            user: newUser[0]
        }

  });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res,next) => {
  // Lógica para autenticar a un usuario existente
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      const error = new Error("Invalid email");
      error.status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
 
    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user
      }
    });


  } catch (error) {
    next(error);

  }
};

export const signOut = async (req, res) => {
  // Lógica para cerrar sesión de un usuario
};

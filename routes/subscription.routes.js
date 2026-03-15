import { Router } from "express";
import { createSubscription, getUserSubscription } from "../controllers/subscription.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import { get } from "mongoose";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => res.send( {title: 'GET all subscriptions'} ));

subscriptionRouter.get("/:id", (req, res) => res.send( {title: 'GET subscription details'} ));

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", (req, res) => res.send( {title: 'Update subscription by id'} ));

subscriptionRouter.delete("/:id", (req, res) => res.send( {title: 'Delete subscription by id'} ));

subscriptionRouter.get("/user/:id", authorize, getUserSubscription);

subscriptionRouter.put("/:id/cancel", (req, res) => res.send( {title: 'Cancel subscription'} ));

subscriptionRouter.get("/upcoming-renewals", (req, res) => res.send( {title: 'GET upcoming renewals'} ));

export default subscriptionRouter;


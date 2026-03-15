import { Router } from "express";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => res.send( {title: 'GET all subscriptions'} ));

subscriptionRouter.get("/:id", (req, res) => res.send( {title: 'GET subscription by id'} ));

subscriptionRouter.post("/", (req, res) => res.send( {title: 'Create subscription'} ));

subscriptionRouter.put("/:id", (req, res) => res.send( {title: 'Update subscription by id'} ));

subscriptionRouter.delete("/:id", (req, res) => res.send( {title: 'Delete subscription by id'} ));

subscriptionRouter.get("/user/:id", (req, res) => res.send( {title: 'GET subscriptions by user id'} ));

subscriptionRouter.put("/:id/cancel", (req, res) => res.send( {title: 'Cancel subscription'} ));

subscriptionRouter.get("/upcoming-renewals", (req, res) => res.send( {title: 'GET upcoming renewals'} ));

export default subscriptionRouter;


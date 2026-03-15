import Subscription from "../models/subscription.model.js";


export const createSubscription = async (req, res,next) => {
try{

    const subscription = await Subscription.create({
        ...req.body,
        user: req.user._id,

    });

    res.status(201).json({success: true, data: subscription});

}catch(error){

    next(error);
}
}

export const getUserSubscription = async (req, res,next) => {
try{
    //check if the user is the owner of the subscription
    if(req.user.id != req.params.id){
        const error = new Error("You are not authorized to view this subscription");
        error.status = 401;
        throw error;
    }
    const subscription = await Subscription.find({ user: req.params.id });
    res.status(200).json({success: true, data: subscription});

}catch(error){
    next(error);
}
}
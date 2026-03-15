import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name : {
        type : String,
        required : [true, "Name is required"],
        trim : true,
        minlength : [3, "Name must be at least 3 characters long"],
        maxlength : [50, "Name must be less than 50 characters long"]
    },
    email : {
        type : String,
        required : [true, "Email is required"],
        unique : true,
        trim : true,
        lowercase : true,
        match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"] //example: user@example.com
    },
    password : {
        type : String,
        required : [true, "Password is required"],
        minlength : [6, "Password must be at least 6 characters long"],
        maxlength : [128, "Password must be less than 128 characters long"]
    }
}, {
    timestamps : true
    });

    const User = mongoose.model("User", userSchema);

    export default User;
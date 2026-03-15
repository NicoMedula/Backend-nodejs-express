import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema( { 
    name : {
        type : String,
        required : [true, "Subscription is required"],
        trim : true,
        minlength : [3, "Name must be at least 3 characters long"],
        maxlength : [50, "Name must be less than 50 characters long"]
    },
    price : {
        type : Number,
        required : [true, "Price subscription is required"],
        min : [0, "Price must be a positive number"],
        max : [1000, "Price must be less than 10000"]
    },
    currency : {
        type : String,
        enum: ["USD", "EUR", "GBP"],
        default : "USD"
        },

        frequency : {
            type : String,
            enum : ["daily", "weekly", "monthly", "yearly"],
        },

        category : {
            type : String,
            enum : ["entertainment", "education", "productivity", "health", "other"],
            required : [true, "Category subscription is required"]
        },
        paymentMethod : {
            type : String,
            trim : true,
            required : [true, "Payment method subscription is required"]
        }, 
        status : {
            type : String,
            enum : ["active", "cancelled", "expired"],
            default : "active"
        },
        startDate : {
            type : Date,
            required : true,
            validate : {
                validator : (value) => value <= new Date(),
                message : "Start date cannot be in the past"
            }   
        },
         renewalDate : {
            type : Date,
            
            validate : {
                validator : function(value) {
                    return value > this.startDate;
                },
                message : "Renewal date must be after start date"
            }   
        },
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
            index : true
        }
       

}, {timestamps : true});

subscriptionSchema.pre("save", function(next) {
    if (!this.renewalDate){
        const renewalPeriods = {
            daily : 1,
            weekly : 7,
            monthly : 30,
            yearly : 365
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
       
    }

    if (this.renewalDate < new Date()) {
        this.status = "expired";

    }
    //next();

    });

    const Subscription = mongoose.model("Subscription", subscriptionSchema);
    
    export default Subscription;
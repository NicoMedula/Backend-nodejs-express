import dayjs from "dayjs";
import { emailTemplates } from "../utils/email-template.js";
import transporter, { accountEmail} from "../config/nodemailer.js";

export const sendRimenderEmail = async ({to, type, subscription}) => {
    if (!to || !type) {throw new Error("Missing required parameters: to, type, subscription");}

    const template = emailTemplates.find((t) => t.label === type);

    if (!template) {throw new Error(`Email template not found for type: ${type}`);}

    const emailInfo = {
        userName : subscription.user.name,
        subscriptionName : subscription.name,
        renewalDate : dayjs(subscription.renewalDate).format("MMM D, YYYY"),
        planName : subscription.plan,
        price: `${subscription.price} ${subscription.currency} per ${subscription.frequency}`,
        paymentMethod : subscription.paymentMethod,
    }

    const message = template.generateBody(emailInfo);
    const subject = template.generateSubject(emailInfo);

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: subject,
        html: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
}
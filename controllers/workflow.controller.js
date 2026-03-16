import dayjs from 'dayjs';
import Subscription from '../models/subscription.model.js';
import {createRequire} from 'module';
import {sendRimenderEmail} from '../utils/send-email.js';


const require = createRequire(import.meta.url);


const REMINDERS = [7, 5, 2, 1]; // days before renewal date to send reminders

const {serve} = require('@upstash/workflow/express');

export const sendReminder = serve( async (context) => {
    const {subscriptionId} = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== 'active') {
        return
    }
    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {

        // Send reminder email
        console.log(`Renewal date has passed for subscription ${subscriptionId}.Stopping workflow.`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `reminder-${daysBefore}-days`, reminderDate);

        }

        if (dayjs().now.inSame(reminderDate, 'days')) {
        await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
        }

       
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId)
        .populate('user', 'email name');

    })
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);

        await sendRimenderEmail({
            to: subscription.user.email,
            type: label,
            subscription: subscription
        });
    });
}

import dayjs from 'dayjs';
import Subscription from '../models/subscription.model.js';
import {createRequire} from 'module';

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

        await triggerReminder(context, `reminder-${daysBefore}-days`);
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

const triggerReminder = async (context, label ) => {
    return await context.run(label, () => {
        console.log(`Triggering ${label} reminder`);
    });
}

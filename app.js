import express from 'express';
import {PORT} from './config/env.js';
import userRouter from './routes/user.routes.js';
import subscriberRouter from './routes/subscription.routes.js';
import authRouter from './routes/auth.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
import workflowRouter from './routes/workflow.routes.js';




const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriberRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/workflows', workflowRouter);
app.use(errorMiddleware);




app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(PORT, async () => {
    console.log(`Example app listening on port http://localhost:${PORT}`);

    await connectToDatabase();
});

export default app;
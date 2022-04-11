import 'dotenv/config.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Fetch Routes
import baseRoutes from './modules/base/base.routes.js';
import postRoutes from './modules/posts/post.routes.js';
import userRoutes from './modules/users/user.routes.js';
import errorRoutes from './modules/errors/error.routes.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ exposedHeaders: ['x-session-id'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('../client/public'));
app.use(cookieParser(process.env.COOKIE_KEY));

// Routes
baseRoutes(app);
postRoutes(app);
userRoutes(app);
errorRoutes(app);

// eslint-disable-next-line no-console
app.listen(process.env.PORT || 3000, () => { console.log('App Started...🌎 🚀'); });

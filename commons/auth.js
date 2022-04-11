import { auth } from '../modules/users/user.services.js';

export default async (request, response, next) => {
  try {
    const sessionId = request.signedCookies.sessionId || request.headers['x-session-id'];
    request.user = await auth(sessionId);
    next();
  } catch (error) {
    next(error);
  }
};

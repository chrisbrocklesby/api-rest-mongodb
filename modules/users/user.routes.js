import * as userServices from './user.services.js';

export default (route) => {
  route.post('/users/register', async (request, response, next) => {
    try {
      const data = await userServices.register(request.body);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.post('/users/login', async (request, response, next) => {
    try {
      const data = await userServices.login(request.body);
      response
        .cookie('sessionId', data.sessionId, {
          httpOnly: true,
          secure: !!(process.env.NODE_ENV === 'production'),
          maxAge: 2592000000,
          signed: true,
        })
        .json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.post('/users/verify', async (request, response, next) => {
    try {
      const data = await userServices.verifyEmail(request.body);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.post('/users/forgotpassword', async (request, response, next) => {
    try {
      const data = await userServices.forgotPassword(request.body);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.post('/users/resetpassword', async (request, response, next) => {
    try {
      const data = await userServices.resetPassword(request.body);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.get('/users/logout', async (request, response, next) => {
    try {
      const sessionId = request.signedCookies.sessionId || request.headers['x-session-id'];
      const data = await userServices.logout(sessionId);
      response
        .clearCookie('sessionId')
        .json({ data });
    } catch (error) {
      next(error);
    }
  });
};

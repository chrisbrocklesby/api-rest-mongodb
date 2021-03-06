export default (route) => {
  route.use((error, request, response, next) => {
    if (error) {
      let statusCode = 500;
      if (error.name === 'authError') { statusCode = 401; }
      if (error.name === 'badRequest') { statusCode = 400; }

      response
        .status(statusCode)
        .json({
          error: {
            name: error.name || 'Error',
            message: error.message,
          },
        });
    } else {
      next();
    }
  });

  route.use((request, response, next) => {
    response
      .status(404)
      .json({ error: { message: 'Not Found' } });
    return next();
  });
};

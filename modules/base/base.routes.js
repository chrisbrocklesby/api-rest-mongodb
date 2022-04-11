export default (route) => {
  route.get('/', (request, response, next) => {
    try {
      response.json({ api: 'ok', date: new Date() });
    } catch (error) {
      next(error);
    }
  });
};

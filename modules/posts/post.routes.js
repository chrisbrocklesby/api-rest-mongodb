import * as postServices from './post.services.js';
import auth from '../../commons/auth.js';

export default (route) => {
  route.get('/posts', auth, async (request, response, next) => {
    try {
      const data = await postServices.index(request.query.nextFrom);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.get('/posts/:id', auth, async (request, response, next) => {
    try {
      const data = await postServices.find(request.params.id);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.post('/posts', auth, async (request, response, next) => {
    try {
      const data = await postServices.create(request.body);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.patch('/posts/:id', auth, async (request, response, next) => {
    try {
      const data = await postServices.update(request.params.id, request.body);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  route.delete('/posts/:id', auth, async (request, response, next) => {
    try {
      const data = await postServices.remove(request.params.id);
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });
};

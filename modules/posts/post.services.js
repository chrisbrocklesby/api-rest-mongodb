import * as postRepository from './post.repository.js';

export const index = async (nextFrom) => {
  const query = await postRepository.index(nextFrom);
  return query;
};

export const find = async (_id) => {
  const query = await postRepository.findById(_id);
  return query;
};

export const create = async (payload) => {
  const query = await postRepository.insert(payload);
  return query;
};

export const update = async (_id, payload) => {
  const data = payload || {};

  delete data._id;
  delete data.updatedAt;
  delete data.createdAt;

  const query = await postRepository.update(_id, data);
  if (!query) { throw Object({ name: 'notFound', message: 'Post not found' }); }

  return { status: 'ok', message: 'Post updated' };
};

export const remove = async (_id) => {
  const query = await postRepository.remove(_id);
  if (!query) { throw Object({ name: 'notFound', message: 'Post not found' }); }

  return { status: 'ok', message: 'Post deleted' };
};

import { Client, ObjectId } from '../../db.js';

export const index = async () => {
  const client = await Client();
  const data = await client.db().collection('posts').find().toArray();

  client.close();
  return data;
};

export const find = async (_id) => {
  const client = await Client();
  const data = await client.db().collection('posts').findOne({ _id: ObjectId(_id) });

  client.close();
  return data;
};

export const create = async (payload) => {
  const client = await Client();
  const data = await client.db().collection('posts')
    .insertOne({
      title: payload.title,
      body: payload.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  client.close();
  return data;
};

export const update = async (_id, payload) => {
  const client = await Client();
  const data = await client.db().collection('posts')
    .updateOne({ _id: ObjectId(_id) }, { $set: { payload } });

  if (data.matchedCount === 0) { throw Object({ name: 'badRequest', message: 'Post not found' }); }

  client.close();
  return { status: 'ok', message: 'Post updated' };
};

export const remove = async (_id) => {
  const client = await Client();
  const data = await client.db().collection('posts')
    .deleteOne({ _id: ObjectId(_id) });

  if (data.deletedCount === 0) { throw Object({ name: 'badRequest', message: 'Post not found' }); }

  client.close();
  return { status: 'ok', message: 'Post deleted' };
};

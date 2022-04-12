import { Client, ObjectId } from '../../commons/db.js';

export const index = async (nextFrom) => {
  const client = await Client();
  const data = await client.db().collection('posts')
    .find((nextFrom) ? { _id: { $gt: ObjectId(nextFrom) } } : {})
    .sort({ _id: 1 })
    .limit(100)
    .toArray();

  client.close();
  return data;
};

export const findById = async (_id) => {
  const client = await Client();
  const data = await client.db().collection('posts').findOne({ _id: ObjectId(_id) });

  client.close();
  return data;
};

export const insert = async (payload) => {
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
    .updateOne({ _id: ObjectId(_id) }, {
      $set: {
        ...payload,
        updatedAt: new Date(),
      },
    });

  if (data.matchedCount === 0) { return null; }

  client.close();
  return { status: 'ok', message: 'Post updated' };
};

export const remove = async (_id) => {
  const client = await Client();
  const data = await client.db().collection('posts')
    .deleteOne({ _id: ObjectId(_id) });

  if (data.deletedCount === 0) { return null; }

  client.close();
  return { status: 'ok', message: 'Post deleted' };
};

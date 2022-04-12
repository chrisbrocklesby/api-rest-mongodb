import { Client, ObjectId } from '../../commons/db.js';

export const findByEmail = async (email) => {
  const client = await Client();
  const query = await client.db().collection('users').findOne({ email });
  client.close();
  return query;
};

export const findById = async (_id) => {
  const client = await Client();
  const query = await client.db().collection('users').findOne({ _id: ObjectId(_id) });
  client.close();
  return query;
};

export const insert = async (payload) => {
  const client = await Client();
  const query = await client.db().collection('users').insertOne({
    email: payload.email,
    password: payload.password,
    emailVerified: payload.emailVerified || false,
    token: payload.token || null,
    sessions: payload.token || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  client.close();
  return query;
};

export const update = async (_id, payload) => {
  const client = await Client();
  const query = await client.db().collection('users').updateOne({ _id: ObjectId(_id) }, {
    $set: {
      ...payload,
      updatedAt: new Date(),
    },
  });
  if (query.matchedCount === 0) { return null; }

  client.close();
  return query;
};

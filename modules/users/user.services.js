import bcrypt from 'bcrypt';
import { Client, ObjectId } from '../../db.js';
import sendEmail from '../../commons/email.js';

const generateToken = () => `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

export const register = async (payload) => {
  const client = await Client();
  const emailExists = !!(await client.collection('users').findOne({ email: payload.email }));

  if (emailExists) { throw Object({ name: 'badRequest', message: 'Email already exists' }); }

  const token = `email_${generateToken()}`;

  await client.db().collection('users').insertOne({
    email: payload.email,
    password: await bcrypt.hash(payload.password, 10),
    emailVerified: false,
    token,
    sessions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  sendEmail({
    to: payload.email,
    subject: 'Email Verification',
    text: `Verify your email ${payload.email} with token: ${token}`,
  });

  await client.close();

  return { status: 'ok', message: 'User registered successfully' };
};

export const login = async (payload) => {
  const client = await Client();
  const user = await client.db().collection('users').findOne({ email: payload.email });

  if (!user) { throw Error('BadRequest: User not found'); }
  if (!(await bcrypt.compare(payload.password, user.password))) { throw Object({ name: 'authError', message: 'Invalid password' }); }
  if (!user.emailVerified) { throw Object({ name: 'badRequest', message: 'Email not verified' }); }

  const session = generateToken();
  const sessions = [session, user.sessions[0], user.sessions[1]].filter((empty) => empty);

  await client.db().collection('users').updateOne({ email: payload.email }, {
    $set: {
      sessions,
      updatedAt: new Date(),
    },
  });

  client.close();
  return { sessionId: `${user._id}.${session}` };
};

export const auth = async (sessionId) => {
  if (!sessionId) { throw Error('Auth: Session ID is required'); }

  const session = sessionId.split('.');
  const client = await Client();
  const user = await client.db().collection('users').findOne({ _id: ObjectId(session[0]) });
  if (!user.sessions.includes(session[1])) { throw Error('Auth: Invalid session'); }

  client.close();

  return { userId: user._id };
};

export const verifyEmail = async (payload) => {
  const client = await Client();
  const user = await client.db().collection('users').findOne({ email: payload.email });

  if (!user) { throw Error('BadRequest: User not found'); }
  if (user.emailVerified) { throw Error('BadRequest: Email is already verified'); }
  if (!payload.token || user.token !== payload.token) { throw Error('Auth: Invalid token'); }
  if (!user.token.includes('email')) { throw Error('Auth: Invalid token type'); }

  await client.db().collection('users').updateOne({ email: payload.email }, {
    $set: {
      emailVerified: true,
      token: null,
      updatedAt: new Date(),
    },
  });

  client.close();
  return { status: 'ok', message: 'User email has been verified' };
};

export const forgotPassword = async (payload) => {
  const client = await Client();
  const user = await client.db().collection('users').findOne({ email: payload.email });

  if (!user) { throw Error('User not found'); }
  if (!user.emailVerified) { throw Error('Email not verified'); }

  const token = `password_${generateToken()}`;

  await client.db().collection('users').updateOne({ email: payload.email }, {
    $set: {
      token,
      updatedAt: new Date(),
    },
  });

  sendEmail({
    to: payload.email,
    subject: 'Reset Password',
    text: `Reset email ${payload.email} password with token: ${token}`,
  });

  client.close();
  return { status: 'ok', message: 'User emailed reset request' };
};

export const resetPassword = async (payload) => {
  const client = await Client();
  const user = await client.db().collection('users').findOne({ email: payload.email });

  if (!user) { throw Error('User not found'); }
  if (!user.emailVerified) { throw Error('Email not verified'); }
  if (!payload.token || user.token !== payload.token) { throw Error('Invalid token'); }
  if (!user.token.includes('password')) { throw Error('Invalid token type'); }

  await client.db().collection('users').updateOne({ email: payload.email }, {
    $set: {
      password: await bcrypt.hash(payload.password, 10),
      token: null,
      updatedAt: new Date(),
    },
  });

  client.close();
  return { status: 'ok', message: 'User password has been reset' };
};

export const logout = async (sessionId) => {
  if (!sessionId) { throw Error('Session ID is required'); }
  const session = sessionId.split('.');
  const client = await Client();
  const user = await client.db().collection('users').findOne({ _id: ObjectId(session[0]) });
  if (!user.sessions.includes(session[1])) { throw Error('Invalid session'); }

  const sessions = user.sessions.filter(((filter) => filter !== session[1]));

  await client.db().collection('users').updateOne({ _id: ObjectId(user._id) }, {
    $set: {
      sessions,
      updatedAt: new Date(),
    },
  });

  client.close();
  return { status: 'ok', message: 'User logged out' };
};

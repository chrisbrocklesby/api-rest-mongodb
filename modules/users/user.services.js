import bcrypt from 'bcrypt';
import * as userRepository from './user.repository.js';
import sendEmail from '../../commons/email.js';

const generateToken = () => `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

export const register = async (payload) => {
  const emailExists = !!(await userRepository.findByEmail(payload.email));

  if (emailExists) { throw Object({ name: 'badRequest', message: 'Email already exists' }); }

  const token = `email_${generateToken()}`;

  await userRepository.insert({
    email: payload.email,
    password: await bcrypt.hash(payload.password, 10),
    emailVerified: false,
    token,
    sessions: [],
  });

  sendEmail({
    to: payload.email,
    subject: 'Email Verification',
    text: `Verify your email ${payload.email} with token: ${token}`,
  });

  return { status: 'ok', message: 'User registered successfully' };
};

export const login = async (payload) => {
  const user = await userRepository.findByEmail(payload.email);

  if (!user) { throw Error('BadRequest: User not found'); }
  if (!(await bcrypt.compare(payload.password, user.password))) { throw Object({ name: 'authError', message: 'Invalid password' }); }
  if (!user.emailVerified) { throw Object({ name: 'badRequest', message: 'Email not verified' }); }

  const session = generateToken();
  const sessions = [session, user.sessions[0], user.sessions[1]].filter((empty) => empty);

  await userRepository.update(user._id, {
    sessions,
  });

  return { sessionId: `${user._id}.${session}` };
};

export const auth = async (sessionId) => {
  if (!sessionId) { throw Error('Auth: Session ID is required'); }

  const session = sessionId.split('.');
  const user = await userRepository.findById(session[0]);
  if (!user.sessions.includes(session[1])) { throw Error('Auth: Invalid session'); }

  return { _id: user._id };
};

export const verifyEmail = async (payload) => {
  const user = await userRepository.findByEmail(payload.email);

  if (!user) { throw Error('BadRequest: User not found'); }
  if (user.emailVerified) { throw Error('BadRequest: Email is already verified'); }
  if (!payload.token || user.token !== payload.token) { throw Error('Auth: Invalid token'); }
  if (!user.token.includes('email')) { throw Error('Auth: Invalid token type'); }

  await userRepository.update(user._id, {
    emailVerified: true,
    token: null,
  });

  return { status: 'ok', message: 'User email has been verified' };
};

export const forgotPassword = async (payload) => {
  const user = await userRepository.findByEmail(payload.email);

  if (!user) { throw Error('User not found'); }
  if (!user.emailVerified) { throw Error('Email not verified'); }

  const token = `password_${generateToken()}`;

  await userRepository.update(user._id, {
    token,
  });

  sendEmail({
    to: payload.email,
    subject: 'Reset Password',
    text: `Reset email ${payload.email} password with token: ${token}`,
  });

  return { status: 'ok', message: 'User emailed reset request' };
};

export const resetPassword = async (payload) => {
  const user = await userRepository.findByEmail(payload.email);

  if (!user) { throw Error('User not found'); }
  if (!user.emailVerified) { throw Error('Email not verified'); }
  if (!payload.token || user.token !== payload.token) { throw Error('Invalid token'); }
  if (!user.token.includes('password')) { throw Error('Invalid token type'); }

  await userRepository.update(user._id, {
    password: await bcrypt.hash(payload.password, 10),
    token: null,
  });

  return { status: 'ok', message: 'User password has been reset' };
};

export const logout = async (sessionId) => {
  if (!sessionId) { throw Error('Session ID is required'); }
  const session = sessionId.split('.');
  const user = await userRepository.findById(session[0]);
  if (!user) { throw Object({ name: 'notFound', message: 'User not found' }); }
  if (!user.sessions.includes(session[1])) { throw Error('Invalid session'); }

  const sessions = user.sessions.filter(((filter) => filter !== session[1]));
  await userRepository.update(user._id, { sessions });

  return { status: 'ok', message: 'User logged out' };
};

export const update = async (_id, payload) => {
  const data = payload || {};

  delete data._id;
  delete data.token;
  delete data.sessions;
  delete data.updatedAt;
  delete data.createdAt;

  if (data.password) { data.password = await bcrypt.hash(data.password, 10); }
  if (data.email) {
    const token = `email_${generateToken()}`;
    data.emailVerified = false;
    data.token = token;

    sendEmail({
      to: data.email,
      subject: 'Email Verification',
      text: `Verify your email ${data.email} with token: ${token}`,
    });
  }

  const query = await userRepository.update(_id, data);
  if (!query) { throw Object({ name: 'notFound', message: 'User not found' }); }

  return { status: 'ok', message: 'User has been updated' };
};

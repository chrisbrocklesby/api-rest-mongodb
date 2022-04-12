import { MongoClient, ObjectId } from 'mongodb';

export const Client = (url) => (new MongoClient(url || process.env.MONGODB_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})).connect();

export { ObjectId };

import { MongoClient } from 'mongodb';
const dns = require('dns');

dns.setServers([
  '8.8.8.8',   
  '8.8.4.4'
]);

const password = 'LlnNytZ7Idoy4Aeu';

const MONGODB_URI = `mongodb+srv://labengherbia:${password}@cluster0.hnu75.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, {
      tls: true
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI, {
    tls: true,
  });
  clientPromise = client.connect();
}

export default clientPromise;

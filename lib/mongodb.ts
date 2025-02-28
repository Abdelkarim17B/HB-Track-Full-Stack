import { MongoClient } from 'mongodb';

const dns = require('dns');
dns.setServers([
  '8.8.8.8',   
  '8.8.4.4'
]);

// Use environment variable or fallback to hardcoded value for static export
const MONGODB_URI = process.env.MONGODB_URI || 
  "mongodb+srv://labengherbia:JoqikZC3334Bx3Jr@cluster0.5hdvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
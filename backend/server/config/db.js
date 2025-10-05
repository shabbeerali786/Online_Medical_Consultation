import mongoose from 'mongoose';

const connectToDatabase = async () => {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';

  // Guard: mongodb+srv URIs must not include a port. If present, strip it.
  if (mongoUri.startsWith('mongodb+srv://')) {
    // mongodb+srv://[user:pass@]host[,host2...][ :port not allowed ]/db?params
    // Extract authority (between scheme and first '/' or '?'), strip any :port from each host
    const scheme = 'mongodb+srv://';
    const rest = mongoUri.slice(scheme.length);
    const slashIndex = rest.search(/[\/?]/);
    const authority = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
    const tail = slashIndex === -1 ? '' : rest.slice(slashIndex);

    const atIndex = authority.lastIndexOf('@');
    const creds = atIndex !== -1 ? authority.slice(0, atIndex + 1) : '';
    const hostsPart = atIndex !== -1 ? authority.slice(atIndex + 1) : authority;

    const sanitizedHosts = hostsPart
      .split(',')
      .map(h => h.replace(/:(\d+)$/, '')) // strip trailing :port per host
      .join(',');

    mongoUri = scheme + creds + sanitizedHosts + tail;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || undefined,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectToDatabase;



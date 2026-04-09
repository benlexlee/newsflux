// Mock database for testing – no real connection
export const AdSettings = {
  findOne: async () => null,
  create: async (data) => data,
  findOneAndUpdate: async (_, data) => data,
};
export const News = {
  find: () => ({ sort: () => ({ limit: () => ({ lean: () => [] }) }) }),
  findById: async () => null,
  findOneAndUpdate: async () => {},
};
export default async function dbConnect() { 
  console.log('Using mock database – no connection required');
  return null; 
}
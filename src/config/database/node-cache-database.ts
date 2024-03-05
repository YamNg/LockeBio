import NodeCache from "node-cache";

// Use node cache as the in-memory database
const database = new NodeCache();

export default database;

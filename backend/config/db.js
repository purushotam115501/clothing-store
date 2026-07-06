const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const useMock = !MONGODB_URI || MONGODB_URI === 'mock' || MONGODB_URI.startsWith('mongodb://mock');

console.log(`[DB] Using ${useMock ? 'SIMULATED JSON DATABASE' : 'MONGODB DATABASE'}`);

if (!useMock) {
  // Connect to actual MongoDB
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('[DB] Connected to MongoDB successfully.'))
  .catch(err => {
    console.error('[DB] MongoDB connection error:', err.message);
    console.log('[DB] Falling back to SIMULATED JSON DATABASE.');
    process.env.MONGODB_URI = ''; // Force mock on subsequent checks
  });
}

// Ensure database data folder exists for JSON mock
const dataFolder = path.join(__dirname, '../data');
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}
const dbFilePath = path.join(dataFolder, 'simulated_db.json');

// Initialize empty simulated DB file if it doesn't exist
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify({
    users: [],
    products: [],
    orders: []
  }, null, 2));
}

// Function to read JSON database
function readJSONDb() {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], products: [], orders: [] };
  }
}

// Function to write JSON database
function writeJSONDb(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

// Query helper for chaining (mocking mongoose query options)
class MockQuery {
  constructor(results) {
    this.results = Array.isArray(results) ? results : [results].filter(Boolean);
  }

  sort(sortOptions) {
    if (!sortOptions) return this;
    const sortField = typeof sortOptions === 'string' ? sortOptions : Object.keys(sortOptions)[0];
    const desc = typeof sortOptions === 'string' 
      ? sortField.startsWith('-') 
      : sortOptions[sortField] === -1 || sortOptions[sortField] === 'desc';
    
    const field = typeof sortOptions === 'string' && sortField.startsWith('-') 
      ? sortField.substring(1) 
      : sortField;

    this.results.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
      
      if (typeof valA === 'string') {
        return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return desc ? valB - valA : valA - valB;
    });
    return this;
  }

  select() {
    return this; // Mock select (always return full object)
  }

  populate() {
    return this; // Mock populate (simulate resolved relations)
  }

  limit(count) {
    this.results = this.results.slice(0, count);
    return this;
  }

  skip(count) {
    this.results = this.results.slice(count);
    return this;
  }

  then(onResolve, onReject) {
    return Promise.resolve(this.results).then(onResolve, onReject);
  }

  catch(onReject) {
    return Promise.resolve(this.results).catch(onReject);
  }
}

// Instance wrapper to mimic Mongoose document instances (with save, etc.)
function makeInstance(data, collectionName) {
  if (!data) return null;
  const instance = { ...data };
  
  Object.defineProperty(instance, 'save', {
    enumerable: false,
    value: function() {
      const db = readJSONDb();
      const idx = db[collectionName].findIndex(x => x._id === this._id);
      if (idx !== -1) {
        db[collectionName][idx] = { ...this };
      } else {
        db[collectionName].push({ ...this });
      }
      writeJSONDb(db);
      return Promise.resolve(this);
    }
  });

  return instance;
}

// Mock Model Factory
class MockModel {
  constructor(name) {
    this.collectionName = name.toLowerCase() + 's';
  }

  find(query = {}) {
    const db = readJSONDb();
    let list = db[this.collectionName] || [];

    // Filter by query properties
    if (Object.keys(query).length > 0) {
      list = list.filter(item => {
        for (const key in query) {
          // Exact match
          if (query[key] && typeof query[key] === 'object' && ('$in' in query[key] || '$gte' in query[key] || '$lte' in query[key] || '$regex' in query[key])) {
            const op = query[key];
            if ('$in' in op && Array.isArray(op['$in'])) {
              const matches = op['$in'].some(val => 
                Array.isArray(item[key]) ? item[key].includes(val) : item[key] === val
              );
              if (!matches) return false;
            }
            if ('$gte' in op && item[key] < op['$gte']) return false;
            if ('$lte' in op && item[key] > op['$lte']) return false;
            if ('$regex' in op) {
              const regex = new RegExp(op['$regex'], op['$options'] || 'i');
              if (!regex.test(item[key] || '')) return false;
            }
          } else if (query[key] !== undefined) {
            // Simple match or array inclusion
            if (Array.isArray(item[key])) {
              if (!item[key].includes(query[key])) return false;
            } else if (item[key] !== query[key]) {
              return false;
            }
          }
        }
        return true;
      });
    }

    return new MockQuery(list.map(item => makeInstance(item, this.collectionName)));
  }

  findOne(query = {}) {
    const db = readJSONDb();
    let list = db[this.collectionName] || [];

    const found = list.find(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });

    return Promise.resolve(makeInstance(found, this.collectionName));
  }

  findById(id) {
    const db = readJSONDb();
    let list = db[this.collectionName] || [];
    const found = list.find(item => String(item._id) === String(id));
    return Promise.resolve(makeInstance(found, this.collectionName));
  }

  create(data) {
    const db = readJSONDb();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    db[this.collectionName].push(newDoc);
    writeJSONDb(db);
    return Promise.resolve(makeInstance(newDoc, this.collectionName));
  }

  findByIdAndUpdate(id, update, options = {}) {
    const db = readJSONDb();
    const list = db[this.collectionName] || [];
    const idx = list.findIndex(item => String(item._id) === String(id));
    if (idx === -1) return Promise.resolve(null);

    const target = list[idx];
    const updatedDoc = {
      ...target,
      ...(update.$set || update),
      updatedAt: new Date().toISOString()
    };
    list[idx] = updatedDoc;
    writeJSONDb(db);
    return Promise.resolve(makeInstance(updatedDoc, this.collectionName));
  }

  findByIdAndDelete(id) {
    const db = readJSONDb();
    const list = db[this.collectionName] || [];
    const idx = list.findIndex(item => String(item._id) === String(id));
    if (idx === -1) return Promise.resolve(null);

    const deleted = list.splice(idx, 1)[0];
    writeJSONDb(db);
    return Promise.resolve(makeInstance(deleted, this.collectionName));
  }

  countDocuments(query = {}) {
    return this.find(query).then(results => results.length);
  }
}

// Export wrapper that maps Mongoose when using real db, or Mock items when using mock
module.exports = {
  connect: () => Promise.resolve(),
  Schema: function(definition) { this.definition = definition; },
  model: function(name, schema) {
    if (!useMock) {
      // Returns actual Mongoose model
      return mongoose.model(name, schema);
    } else {
      // Returns MockModel
      return new MockModel(name);
    }
  },
  // Re-export other mongoose utilities if needed, or pass through
  isMock: useMock,
  readJSONDb,
  writeJSONDb,
};

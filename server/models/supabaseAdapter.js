const { supabase, isSupabaseConfigured } = require("../config/supabase");
const crypto = require("crypto");

// Fallback local memory store when Supabase environment credentials are placeholder
const inMemoryStore = {
  users: [],
  provider_profiles: [],
  bookings: [],
  reviews: [],
  conversations: [],
  messages: [],
  verifications: [],
  skill_details: [],
  projects: [],
  categories: [],
};

const generateUuid = () => crypto.randomUUID();

// Helper to convert snake_case object to camelCase object
const snakeToCamel = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj) || obj instanceof Date) {
    return obj;
  }
  const camelObj = {};
  for (const key of Object.keys(obj)) {
    let camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    if (key === "id") camelKey = "_id"; // Alias PostgreSQL id as _id for controller compatibility
    camelObj[camelKey] = obj[key];
  }
  if (camelObj._id) camelObj.id = camelObj._id;
  return camelObj;
};

// Helper to convert camelCase object to snake_case object
const camelToSnake = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }
  const snakeObj = {};
  for (const key of Object.keys(obj)) {
    if (key === "_id") continue;
    let snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    snakeObj[snakeKey] = obj[key];
  }
  return snakeObj;
};

// Unified Query Engine for Supabase with fallback
const dbStore = {
  table: (tableName) => {
    return {
      insert: async (data) => {
        const id = data._id || data.id || generateUuid();
        const recordData = { ...data, _id: id, id };

        if (isSupabaseConfigured() && supabase) {
          const snakeData = camelToSnake(recordData);
          delete snakeData.id;
          const { data: inserted, error } = await supabase
            .from(tableName)
            .insert([snakeData])
            .select()
            .single();
          if (!error && inserted) {
            return snakeToCamel(inserted);
          }
          if (error) {
            console.warn(`Supabase insert fallback for ${tableName}:`, error.message);
          }
        }

        // Memory Store Fallback
        const now = new Date();
        const doc = {
          ...recordData,
          createdAt: recordData.createdAt || now,
          updatedAt: recordData.updatedAt || now,
        };
        inMemoryStore[tableName] = inMemoryStore[tableName] || [];
        inMemoryStore[tableName].push(doc);
        return snakeToCamel(doc);
      },

      select: async (query = {}) => {
        if (isSupabaseConfigured() && supabase) {
          let sQuery = supabase.from(tableName).select("*");
          // Apply basic equality filters
          for (const [key, val] of Object.entries(query)) {
            const sKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            if (val !== undefined && val !== null) {
              sQuery = sQuery.eq(sKey, val);
            }
          }
          const { data, error } = await sQuery;
          if (!error && data) {
            return data.map(snakeToCamel);
          }
        }

        // Memory Store Fallback
        inMemoryStore[tableName] = inMemoryStore[tableName] || [];
        return inMemoryStore[tableName].filter((item) => {
          for (const [k, v] of Object.entries(query)) {
            if (k === "_id" || k === "id") {
              if (item._id !== v && item.id !== v) return false;
            } else if (item[k] !== v) {
              return false;
            }
          }
          return true;
        }).map(snakeToCamel);
      },

      update: async (filter, updates) => {
        if (isSupabaseConfigured() && supabase) {
          const sFilter = camelToSnake(filter);
          const sUpdates = camelToSnake(updates);
          let sQuery = supabase.from(tableName).update(sUpdates);
          for (const [k, v] of Object.entries(sFilter)) {
            sQuery = sQuery.eq(k, v);
          }
          const { data, error } = await sQuery.select();
          if (!error && data) {
            return data.map(snakeToCamel);
          }
        }

        // Memory Store Fallback
        inMemoryStore[tableName] = inMemoryStore[tableName] || [];
        let updatedCount = 0;
        inMemoryStore[tableName] = inMemoryStore[tableName].map((item) => {
          let match = true;
          for (const [k, v] of Object.entries(filter)) {
            if (k === "_id" || k === "id") {
              if (item._id !== v && item.id !== v) match = false;
            } else if (item[k] !== v) {
              match = false;
            }
          }
          if (match) {
            updatedCount++;
            return { ...item, ...updates, updatedAt: new Date() };
          }
          return item;
        });
        return updatedCount;
      },
    };
  },
  inMemoryStore,
  snakeToCamel,
  camelToSnake,
};

module.exports = dbStore;

const memoryStore = require("./memoryStore");
const supabaseStore = require("./supabaseStore");

const useSupabase = supabaseStore.isSupabaseConfigured();
const activeStore = useSupabase ? supabaseStore : memoryStore;

function getStorageMode() {
  return useSupabase ? "supabase" : "memory";
}

// Both stores now implement the full interface (sessions + users).
const storage = {
  // Session operations
  createSession: activeStore.createSession,
  getSession: activeStore.getSession,
  appendMessages: activeStore.appendMessages,
  saveEvaluation: activeStore.saveEvaluation,
  getStats: activeStore.getStats,
  listSessions: activeStore.listSessions,
  getAnalytics: activeStore.getAnalytics,

  // User operations
  createUser: activeStore.createUser,
  getUserByEmail: activeStore.getUserByEmail,
  getUserById: activeStore.getUserById,
  updateUser: activeStore.updateUser,
  getUserSessions: activeStore.getUserSessions,
  getUserProgress: activeStore.getUserProgress
};

module.exports = {
  storage,
  getStorageMode
};

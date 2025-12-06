const API_BASE = 'http://localhost:3001/api';

export const mongoAPI = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }),
      then: (resolve) => resolve({ data: [], error: null })
    }),
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: {}, error: null }) }) })
  }),
  storage: { from: () => ({ upload: () => Promise.resolve({ error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  removeChannel: () => {},
  channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  rpc: () => Promise.resolve({ error: null })
};

export const mongoAPIReal = {
  // Auth
  async getUser() {
    const response = await fetch(`${API_BASE}/auth/user`);
    return response.ok ? await response.json() : null;
  },

  async signUp(email, password, userData) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...userData })
    });
    return response.ok ? await response.json() : null;
  },

  async signIn(email, password) {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.ok ? await response.json() : null;
  },

  // Jobs
  async getJobs() {
    const response = await fetch(`${API_BASE}/jobs`);
    return response.ok ? await response.json() : [];
  },

  async createJob(jobData) {
    const response = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return response.ok ? await response.json() : null;
  },

  // Applications
  async getApplications() {
    const response = await fetch(`${API_BASE}/applications`);
    return response.ok ? await response.json() : [];
  }
};

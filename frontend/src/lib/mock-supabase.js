// MongoDB API client
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;


export const supabase = {
  auth: {
    getUser: async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/user`);
        if (!response.ok) {
          return { data: { user: null }, error: null };
        }
        const data = await response.json();
        return { data: { user: data }, error: null };
      } catch (error) {
        return { data: { user: null }, error: null };
      }
    },
    signUp: async ({ email, password }) => {
      try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        return { data: { user: data }, error: null };
      } catch (error) {
        return { data: { user: null }, error };
      }
    },
    signInWithPassword: async ({ email, password }) => {
      try {
        const response = await fetch(`${API_BASE}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        return { data: { user: data }, error: null };
      } catch (error) {
        return { data: { user: null }, error };
      }
    },
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: (table) => ({
    select: (fields = '*') => ({
      eq: (field, value) => ({
        single: async () => {
          try {
            const response = await fetch(`${API_BASE}/${table}?${field}=${value}`);
            if (!response.ok) {
              return { data: {}, error: null };
            }
            const data = await response.json();
            return { data: data[0] || {}, error: null };
          } catch (error) {
            return { data: {}, error: null };
          }
        }
      }),
      then: async (resolve) => {
        try {
          const response = await fetch(`${API_BASE}/${table}`);
          if (!response.ok) {
            resolve({ data: [], error: null });
            return;
          }
          const data = await response.json();
          resolve({ data, error: null });
        } catch (error) {
          resolve({ data: [], error: null });
        }
      }
    }),
    insert: (data) => ({
      select: () => ({
        single: async () => {
          try {
            const response = await fetch(`${API_BASE}/${table}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const result = await response.json();
            return { data: result, error: null };
          } catch (error) {
            return { data: null, error };
          }
        }
      })
    })
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: () => Promise.resolve({ error: null })
    })
  },
  removeChannel: () => {},
  channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  rpc: () => Promise.resolve({ error: null })
};

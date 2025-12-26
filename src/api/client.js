

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createApiClient = (getToken) => {
  return {
    createDocument: async (data) => {
      try {
        const token = getToken?.();
        const headers = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/calculator`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error creating document:', error);
        throw error;
      }
    },

    // List documents (logs)
    listDocuments: async () => {
      try {
        const token = getToken?.();
        const headers = {};

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/calculator`, {
          headers
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const logs = await response.json();
        // Convert to Appwrite-like format for compatibility
        return {
          rows: logs.map(log => ({
            ...log,
            $id: log._id,
            id: log._id
          }))
        };
      } catch (error) {
        console.error('Error listing documents:', error);
        throw error;
      }
    },

    // Delete document
    deleteDocument: async (id) => {
      try {
        const token = getToken?.();
        const headers = {};

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/calculator/${id}`, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    },
  };
};
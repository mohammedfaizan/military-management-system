const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:1616"

// Assets API
export const assetsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/assets/get`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch assets")
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/assets/get/${id}`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch asset")
    return response.json()
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/assets/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create asset")
    return response.json()
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/assets/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update asset")
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/assets/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to delete asset")
    return response.json()
  },
}

// Bases API
export const basesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/bases/get`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch bases")
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/bases/get/${id}`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch base")
    return response.json()
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/bases/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create base")
    return response.json()
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/bases/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update base")
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/bases/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to delete base")
    return response.json()
  },
}

// User API
export const userAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/get`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch users")
    return response.json()
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/get/${id}`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch user")
    return response.json()
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create user")
    return response.json()
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update user")
    return response.json()
  },

  updatePassword: async (id, passwordData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/${id}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(passwordData),
    })
    if (!response.ok) throw new Error("Failed to update password")
    return response.json()
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to delete user")
    return response.json()
  },
}

// Purchases API
export const purchasesAPI = {
  // 📦 Create a new purchase bill
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/purchase/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    // if (!response.ok) throw new Error("Failed to create purchase bill");
    // return response.json();

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to create purchase bill";
      throw new Error(errorMessage);
    }

    return result;
  },

  // ✏️ Update a purchase bill by ID
  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/api/purchase/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    // if (!response.ok) throw new Error("Failed to update purchase bill");
    // return response.json();

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to update purchase bill";
      throw new Error(errorMessage);
    }

    return result;
  },

  // ❌ Delete a purchase bill by ID
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/purchase/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    // if (!response.ok) throw new Error("Failed to delete purchase bill");
    // return response.json();
    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to delete purchase bill";
      throw new Error(errorMessage);
    }

    return result;
  },

  // 📃 Get all purchase bills with pagination and filters
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/purchase/getMy?${query}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch purchase bills");
    return response.json();
  },

  // 🔍 Get single purchase bill by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/purchase/get/${id}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch purchase bill");
    return response.json();
  },
};

// Inventory API
export const inventoryAPI = {
  /**
   * Get inventory for the current user's base (with optional asset filter)
   * @param {Object} params - Optional query parameters
   * @param {string} params.asset - Filter by asset ID
   */
  getMyStock: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/stocks/my?${query}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch user inventory");
    return response.json();
  },

  /**
   * Get all inventory (admin only)
   * @param {Object} params - Optional query parameters
   * @param {string} params.base - Filter by base ID
   * @param {string} params.assetType - Filter by asset category
   */
  getAllStock: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/stocks?${query}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch all inventory");
    return response.json();
  },
};

// Transfers API
export const transfersAPI = {
  // 🚚 Create a new transfer bill
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/transfers/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to create transfer bill";
      throw new Error(errorMessage);
    }
    return result;
  },

  // ❌ Delete a transfer bill by ID
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/transfers/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to delete transfer bill";
      throw new Error(errorMessage);
    }

    return result;
  },


  // 📃 Get all transfer bills (for user's base or all depending on role)
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/transfers/getMy?${query}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch transfer bills");
    return response.json();
  },

  // 🔍 Get a single transfer bill by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/transfers/get/${id}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch transfer bill");
    return response.json();
  },
};

// Expenditures API
export const expenditureAPI = {
  // 💸 Create a new expenditure
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/expend/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to create expenditure";
      throw new Error(errorMessage);
    }

    return result;
  },

  // 🔄 Mark assigned assets as expended
  markAssignedAsExpended: async (data, id) => {
    const response = await fetch(`${API_BASE_URL}/api/expend/markAssignedAsExpended/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to mark assets as expended";
      throw new Error(errorMessage);
    }

    return result;
  },

  // ❌ Delete an expenditure by ID
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/expend/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to delete expenditure";
      throw new Error(errorMessage);
    }

    return result;
  },

  // 📋 Get all expenditures for the current user's base
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/expend/getMy?${query}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const result = await response.json();
      const errorMessage = result?.error || result?.message || "Failed to fetch expenditures";
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // 🔍 Get a single expenditure by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/expend/get/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const result = await response.json();
      const errorMessage = result?.error || result?.message || "Failed to fetch expenditure";
      throw new Error(errorMessage);
    }

    return response.json();
  },
};

// Assign Api
export const assignmentAPI = {
  // 📦 Create a new assignment
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/assign/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to create assignment";
      throw new Error(errorMessage);
    }

    return result;
  },

  // ❌ Delete an assignment by ID
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/assign/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to delete assignment";
      throw new Error(errorMessage);
    }

    return result;
  },

  // 📋 Get all assignments for the current user's base
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/assign/getMy?${query}`, {
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to fetch assignments";
      throw new Error(errorMessage);
    }

    return result;
  },

  // 🔍 Get a single assignment by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/assign/get/${id}`, {
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to fetch assignment";
      throw new Error(errorMessage);
    }

    return result;
  },
};

// movement Api
export const movementAPI = {

  // 📋 Get all assignments for the current user's base
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/movement?${query}`, {
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || "Failed to fetch movement logs";
      throw new Error(errorMessage);
    }

    return result;
  },

  // // 🔍 Get a single assignment by ID
  // getById: async (id) => {
  //   const response = await fetch(`${API_BASE_URL}/api/assign/get/${id}`, {
  //     credentials: "include",
  //   });

  //   const result = await response.json();

  //   if (!response.ok) {
  //     const errorMessage = result?.error || result?.message || "Failed to fetch assignment";
  //     throw new Error(errorMessage);
  //   }

  //   return result;
  // },
};

// Data Summary API
export const dataSummaryAPI = {
  /**
   * Get inventory for the current user's base (with optional asset filter)
   * @param {Object} params - Optional query parameters
   * @param {string} params.asset - Filter by asset ID
   */
  getMyStock: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/summary?${query}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch dashboard");
    return response.json();
  },
};
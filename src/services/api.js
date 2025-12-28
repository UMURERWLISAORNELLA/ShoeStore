
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        const err = new Error(data?.error || `HTTP error! status: ${response.status}`);
        err.status = response.status;
        err.responseData = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(username, password) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.makeRequest('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Product methods
  async getProducts(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.category && filters.category !== 'All') {
      queryParams.append('category', filters.category);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return this.makeRequest(endpoint);
  }

  async getProduct(id) {
    return this.makeRequest(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.makeRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getOrders() {
    return this.makeRequest('/orders');
  }

  async getOrder(id) {
    return this.makeRequest(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, status) {
    return this.makeRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Payment methods
  async processMtnMomoPayment(paymentData) {
    return this.makeRequest('/payments/mtn-momo', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentStatus(paymentId) {
    return this.makeRequest(`/payments/status/${paymentId}`);
  }

  async getPaymentHistory() {
    return this.makeRequest('/payments/history');
  }

  // User methods
  async getUserProfile() {
    return this.makeRequest('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateProfile(profileData) {
    return this.updateUserProfile(profileData);
  }

  async changePassword(passwordData) {
    return this.makeRequest('/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async getUsers() {
    return this.makeRequest('/users');
  }

  async updateUserRole(userId, role) {
    return this.makeRequest(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Review methods
  async getProductReviews(productId) {
    return this.makeRequest(`/reviews/product/${productId}`);
  }

  async addReview(productId, rating, comment) {
    return this.makeRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify({ productId, rating, comment }),
    });
  }

  async deleteReview(reviewId) {
    return this.makeRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();

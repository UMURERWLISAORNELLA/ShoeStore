import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import ShoppingCartModal from "@/components/ShoppingCartModal";
import AuthModal from "@/components/AuthModal";
import AdminDashboard from "@/components/AdminDashboard";
import OrderHistory from "@/components/OrderHistory";
import CheckoutModal from "@/components/CheckoutModal";
import ProfileModal from "@/components/ProfileModal";
import ProductDetailModal from "@/components/ProductDetailModal";
import apiService from "../services/api";

const Index = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Men", "Women", "Kids"];

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData.user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }

      // Load products
      await loadProducts();
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts({
        category: selectedCategory,
        search: searchTerm
      });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    try {
      const response = await apiService.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadUsers = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const response = await apiService.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Reload products when filters change
  useEffect(() => {
    if (!loading) {
      loadProducts();
    }
  }, [selectedCategory, searchTerm]);

  // Load orders when user changes
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  // Load users when admin dashboard opens
  useEffect(() => {
    if (showAdmin && user?.role === 'admin') {
      loadUsers();
    }
  }, [showAdmin, user]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart.",
        variant: "destructive"
      });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await apiService.login(username, password);
      setUser(response.user);
      setShowAuth(false);
      toast({
        title: "Welcome!",
        description: `Logged in as ${response.user.username}`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await apiService.register(userData);
      setUser(response.user);
      setShowAuth(false);
      toast({
        title: "Account created!",
        description: `Welcome ${userData.username}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setCart([]);
    setOrders([]);
    setShowAdmin(false);
    setShowOrderHistory(false);
    setShowProfile(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await apiService.updateProfile(profileData);
      const userData = await apiService.getCurrentUser();
      setUser(userData.user);
      setShowProfile(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCheckout = async (customerInfo) => {
    try {
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        customerInfo
      };

      const response = await apiService.createOrder(orderData);
      setCart([]);
      setShowCheckout(false);
      loadOrders(); // Refresh orders
      
      toast({
        title: "Order placed successfully!",
        description: `Order #${response.order.id} has been confirmed.`,
      });
    } catch (error) {
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addProduct = async (productData) => {
    try {
      await apiService.createProduct(productData);
      loadProducts(); // Refresh products
      toast({
        title: "Product added",
        description: "New product has been added to the catalog.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      console.log('Updating product ID:', productId, 'with data:', productData);
      const response = await apiService.updateProduct(productId, productData);
      console.log('Update response:', response);
      loadProducts(); // Refresh products
      toast({
        title: "Product updated",
        description: "Product information has been updated.",
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await apiService.deleteProduct(productId);
      loadProducts(); // Refresh products
      toast({
        title: "Product deleted",
        description: "Product has been removed from the catalog.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewProductDetails = (product) => {
    setSelectedProduct(product);
    loadProductReviews(product.id);
  };

  const loadProductReviews = async (productId) => {
    try {
      const response = await apiService.getProductReviews(productId);
      setProductReviews(response.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setProductReviews([]);
    }
  };

  const handleAddReview = async (productId, rating, comment) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to write a review.",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiService.addReview(productId, rating, comment);
      await loadProductReviews(productId);
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Shoe Store</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none text-white placeholder:text-white/70 focus:ring-0"
                />
              </div>

              {user && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCart(true)}
                    className="text-white hover:bg-white/20 relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-pink text-white text-xs">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                  
                  {user.role === "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdmin(true)}
                      className="text-white hover:bg-white/20"
                    >
                      Admin
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOrderHistory(true)}
                    className="text-white hover:bg-white/20"
                  >
                    Orders
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfile(true)}
                    className="text-white hover:bg-white/20"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm">Welcome, {user.username}!</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-white hover:bg-white/20"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAuth(true)}
                    className="text-white hover:bg-white/20"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-6 animate-fade-in">
            Discover Amazing Products
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Shop the latest trends with our premium collection
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-white text-purple-600 hover:bg-white/90"
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mb-6">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onViewDetails={handleViewProductDetails}
              />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white text-xl">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Shoe Store</h3>
          <p className="opacity-80">Your premier destination for quality products</p>
          <p className="opacity-60 mt-2">© 2024 Shoe Store. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {showCart && (
        <ShoppingCartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
          total={getTotalPrice()}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {showAdmin && user?.role === "admin" && (
        <AdminDashboard
          onClose={() => {
            setShowAdmin(false);
          }}
          products={products}
          orders={orders}
          users={users}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
        />
      )}

      {showOrderHistory && user && (
        <OrderHistory
          onClose={() => setShowOrderHistory(false)}
          orders={orders}
          userRole={user.role}
          allOrders={user.role === "admin" ? orders : undefined}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={getTotalPrice()}
          onClose={() => setShowCheckout(false)}
          onCheckout={handleCheckout}
        />
      )}

      {showProfile && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          reviews={productReviews}
          onClose={() => {
            setSelectedProduct(null);
            setProductReviews([]);
          }}
          onAddToCart={addToCart}
          onAddReview={handleAddReview}
          userLoggedIn={!!user}
        />
      )}
    </div>
  );
};

export default Index;

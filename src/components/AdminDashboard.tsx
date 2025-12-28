
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

interface Order {
  id: number;
  userId: number;
  customerName: string;
  email: string;
  items: any[];
  total: number;
  date: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  email: string;
}

interface AdminDashboardProps {
  onClose: () => void;
  products: Product[];
  orders: Order[];
  users: User[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: number, product: Partial<Product>) => void;
  onDeleteProduct: (id: number) => void;
  onUpdateOrderStatus?: (orderId: number, status: string) => void;
  onProcessRefund?: (orderId: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  products,
  orders,
  users,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onProcessRefund
}) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Men',
    image_url: ''
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(newProduct);
    setNewProduct({ name: '', description: '', price: 0, category: 'Electronics', image_url: '' });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      console.log('Updating product:', editingProduct);
      onUpdateProduct(editingProduct.id, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        image_url: editingProduct.image_url
      });
      setEditingProduct(null);
    }
  };

  const categories = ['Men', 'Women', 'Kids'];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-main border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Admin Dashboard</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/20">
            <TabsTrigger value="products" className="text-white data-[state=active]:bg-white/30">Products</TabsTrigger>
            <TabsTrigger value="inventory" className="text-white data-[state=active]:bg-white/30">Inventory</TabsTrigger>
            <TabsTrigger value="orders" className="text-white data-[state=active]:bg-white/30">Orders</TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/30">Users</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/30">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-name" className="text-white">Name</Label>
                      <Input
                        id="product-name"
                        value={editingProduct ? editingProduct.name : newProduct.name}
                        onChange={(e) => {
                          if (editingProduct) {
                            setEditingProduct({ ...editingProduct, name: e.target.value });
                          } else {
                            setNewProduct({ ...newProduct, name: e.target.value });
                          }
                        }}
                        className="bg-white/20 border-white/30 text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="product-price" className="text-white">Price</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={editingProduct ? editingProduct.price : newProduct.price}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          if (editingProduct) {
                            setEditingProduct({ ...editingProduct, price });
                          } else {
                            setNewProduct({ ...newProduct, price });
                          }
                        }}
                        className="bg-white/20 border-white/30 text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="product-category" className="text-white">Category</Label>
                    <Select
                      value={editingProduct ? editingProduct.category : newProduct.category}
                      onValueChange={(value) => {
                        if (editingProduct) {
                          setEditingProduct({ ...editingProduct, category: value });
                        } else {
                          setNewProduct({ ...newProduct, category: value });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="product-image" className="text-white">Image URL</Label>
                    <Input
                      id="product-image"
                      value={editingProduct ? editingProduct.image_url : newProduct.image_url}
                      onChange={(e) => {
                        if (editingProduct) {
                          setEditingProduct({ ...editingProduct, image_url: e.target.value });
                        } else {
                          setNewProduct({ ...newProduct, image_url: e.target.value });
                        }
                      }}
                      className="bg-white/20 border-white/30 text-white"
                      placeholder="https://images.unsplash.com/..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="product-description" className="text-white">Description</Label>
                    <Textarea
                      id="product-description"
                      value={editingProduct ? editingProduct.description : newProduct.description}
                      onChange={(e) => {
                        if (editingProduct) {
                          setEditingProduct({ ...editingProduct, description: e.target.value });
                        } else {
                          setNewProduct({ ...newProduct, description: e.target.value });
                        }
                      }}
                      className="bg-white/20 border-white/30 text-white"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button type="submit" className="bg-gradient-purple hover:bg-gradient-pink text-white">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingProduct(null)}
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id} className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-white font-semibold">{product.name}</h3>
                    <p className="text-white/80 text-sm">${product.price}</p>
                    <p className="text-white/60 text-xs">{product.category}</p>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteProduct(product.id)}
                        className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h4 className="text-white font-semibold">{product.name}</h4>
                          <p className="text-white/60 text-sm">{product.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white/60 text-xs">Current Stock</p>
                          <p className={`text-lg font-bold ${
                            (product as any).stock_quantity > 10 
                              ? 'text-green-400' 
                              : (product as any).stock_quantity > 0 
                              ? 'text-yellow-400' 
                              : 'text-red-400'
                          }`}>
                            {(product as any).stock_quantity || 0}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const currentStock = (product as any).stock_quantity || 0;
                              if (currentStock > 0) {
                                onUpdateProduct(product.id, { stock_quantity: currentStock - 1 } as any);
                              }
                            }}
                            className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                          >
                            -
                          </Button>
                          
                          <Input
                            type="number"
                            value={(product as any).stock_quantity || 0}
                            onChange={(e) => {
                              const newStock = parseInt(e.target.value) || 0;
                              onUpdateProduct(product.id, { stock_quantity: newStock } as any);
                            }}
                            className="w-20 bg-white/20 border-white/30 text-white text-center"
                          />
                          
                          <Button
                            size="sm"
                            onClick={() => {
                              const currentStock = (product as any).stock_quantity || 0;
                              onUpdateProduct(product.id, { stock_quantity: currentStock + 1 } as any);
                            }}
                            className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4">
              {orders.map(order => (
                <Card key={order.id} className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-semibold">Order #{order.id}</h3>
                        <p className="text-white/80">{order.customerName}</p>
                        <p className="text-white/60 text-sm">{order.email}</p>
                        <p className="text-white/60 text-sm">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">RWF {typeof order.total === 'number' ? order.total.toLocaleString('en-US', { maximumFractionDigits: 0 }) : (parseFloat(order.total) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                        <p className="text-white/60 text-sm">{order.items?.length || 0} items</p>
                      </div>
                    </div>
                    
                    <div className="mb-4 space-y-2">
                      {(order.items || []).filter(Boolean).map((item, index) => {
                        const name = item.product_name || item.name || '';
                        const qty = Number(item.quantity) || 0;
                        const unitPrice = item.unit_price != null ? Number(item.unit_price) : (item.price != null ? Number(item.price) : (item.total_price != null && qty > 0 ? Number(item.total_price) / qty : 0));
                        return (
                          <div key={index} className="flex justify-between text-white/80 text-sm">
                            <span>{name} x{qty}</span>
                            <span>RWF {(unitPrice * qty).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="border-t border-white/20 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Order Status</Label>
                        <Select
                          value={(order as any).status || 'pending'}
                          onValueChange={(value) => onUpdateOrderStatus?.(order.id, value)}
                        >
                          <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Payment Status</Label>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          (order as any).payment_status === 'completed' 
                            ? 'bg-green-500/20 text-green-300' 
                            : (order as any).payment_status === 'refunded'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {(order as any).payment_status || 'pending'}
                        </span>
                      </div>
                      
                      {(order as any).payment_status === 'completed' && (order as any).status !== 'cancelled' && (
                        <Button
                          size="sm"
                          onClick={() => onProcessRefund?.(order.id)}
                          className="w-full bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                        >
                          Process Refund
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4">
              {users.map(user => (
                <Card key={user.id} className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">{user.username}</h3>
                        <p className="text-white/80">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-white font-semibold text-lg">Total Products</h3>
                  <p className="text-3xl font-bold text-white mt-2">{products.length}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-white font-semibold text-lg">Total Orders</h3>
                  <p className="text-3xl font-bold text-white mt-2">{orders.length}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-white font-semibold text-lg">Total Revenue</h3>
                  <p className="text-3xl font-bold text-white mt-2">
                    RWF {orders.reduce((sum, order) => {
                      const total = typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0;
                      return sum + total;
                    }, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDashboard;


import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  userId: number;
  customerName: string;
  email: string;
  items: any[];
  total: number;
  date: string;
}

interface OrderHistoryProps {
  onClose: () => void;
  orders: Order[];
  userRole: string;
  allOrders?: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onClose, orders, userRole, allOrders }) => {
  const displayOrders = userRole === 'admin' && allOrders ? allOrders : orders;

  const generateReceipt = (order: Order) => {
    const items = Array.isArray(order.items) ? order.items.filter(Boolean) : [];
    const itemsHtml = items.map((item) => {
      const name = item.product_name || item.name || '';
      const qty = Number(item.quantity) || 0;
      let unitPrice = 0;
      if (item.unit_price != null) unitPrice = Number(item.unit_price);
      else if (item.price != null) unitPrice = Number(item.price);
      else if (item.total_price != null && qty > 0) unitPrice = Number(item.total_price) / qty;
      const lineTotal = (unitPrice * qty) || 0;
      return `
            <div class="item">
              <span>${name} x${qty}</span>
              <span>RWF ${Number(lineTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>`;
    }).join('');

    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          .items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1> Shoe Store</h1>
          <h2>Receipt #${order.id}</h2>
        </div>
        
        <div class="order-info">
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
        </div>
        
        <div class="items">
          <h3>Items Purchased:</h3>
          ${itemsHtml}
        </div>
        
        <div class="total">
          Total: RWF ${Number(order.total || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #666;">
          <p>Thank you for shopping with Shoe Store!</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-main border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {userRole === 'admin' ? 'All Orders' : 'Your Order History'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {displayOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/80">No orders found</p>
            </div>
          ) : (
            displayOrders.map(order => (
              <Card key={order.id} className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">Order #{order.id}</h3>
                      <p className="text-white/80">{order.customerName}</p>
                      <p className="text-white/60">{order.email}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xl">RWF {Number(order.total).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                      <Button
                        onClick={() => generateReceipt(order)}
                        className="mt-2 bg-gradient-purple hover:bg-gradient-pink text-white text-sm"
                      >
                        Download Receipt
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Items:</h4>
                    {(order.items || []).filter(Boolean).map((item: any, index: number) => {
                      const name = item.product_name || item.name || '';
                      const qty = Number(item.quantity) || 0;
                      const unitPrice = item.unit_price != null ? Number(item.unit_price) : (item.price != null ? Number(item.price) : (item.total_price != null && qty > 0 ? Number(item.total_price) / qty : 0));
                      const imageSrc = item.image_url || item.image || '';

                      return (
                        <div key={index} className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={imageSrc}
                              alt={name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="text-white font-medium">{name}</p>
                              <p className="text-white/60 text-sm">Quantity: {qty}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">RWF {Number(unitPrice || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} each</p>
                            <p className="text-white/80 text-sm">
                              Total: RWF {Number((unitPrice * qty) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderHistory;

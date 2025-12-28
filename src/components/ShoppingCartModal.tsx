
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShoppingCartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
  total: number;
}

const ShoppingCartModal: React.FC<ShoppingCartModalProps> = ({
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-main border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Shopping Cart</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/80">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-4 bg-white/10 rounded-lg p-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-white/80">${item.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 text-center bg-white/20 border-white/30 text-white"
                    />
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveItem(item.id)}
                      className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-white font-bold">
                    RWF {(item.price * item.quantity).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="border-t border-white/20 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white text-lg font-bold">Total: RWF {total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={onCheckout}
                className="flex-1 bg-gradient-pink text-white hover:bg-gradient-purple"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingCartModal;

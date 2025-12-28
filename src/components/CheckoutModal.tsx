
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone } from "lucide-react";
import MtnMomoPayment from "./MtnMomoPayment";
import apiService from "../services/api";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutModalProps {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onCheckout: (customerInfo: { fullName: string; email: string; address: string; city: string; zipCode: string }) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ cart, total, onClose, onCheckout }) => {
  const { toast } = useToast();
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [showPayment, setShowPayment] = useState(false);
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create order first
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        customerInfo
      };

      const response = await apiService.createOrder(orderData);
      setOrder(response.order);
      setShowPayment(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast({
      title: "Payment Successful!",
      description: "Your order has been confirmed and payment processed.",
    });
    onClose();
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  const handleCreditCardPayment = () => {
    // Simulate credit card payment
    setTimeout(() => {
      handlePaymentSuccess({});
    }, 2000);
  };

  if (showPayment && order) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-gradient-main border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Complete Payment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-white">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-bold">RWF {order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {paymentMethod === 'mtn_momo' ? (
              <MtnMomoPayment
                order={order}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            ) : (
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Credit Card Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <p className="text-white/80 mb-4">
                      This is a demo payment. Click the button below to simulate a successful payment.
                    </p>
                    <Button
                      onClick={handleCreditCardPayment}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Complete Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              variant="outline"
              onClick={() => setShowPayment(false)}
              className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Back to Order Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-main border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Checkout</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-white/80">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-white font-bold">
                    RWF {(item.price * item.quantity).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              ))}
              
              <Separator className="bg-white/20" />
              
              <div className="flex justify-between items-center">
                <span className="text-white text-lg">Subtotal:</span>
                <span className="text-white text-lg">RWF {total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white text-lg">Shipping:</span>
                <span className="text-white text-lg">Free</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white text-lg">Tax:</span>
                <span className="text-white text-lg">RWF {(total * 0.08).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
              
              <Separator className="bg-white/20" />
              
              <div className="flex justify-between items-center">
                <span className="text-white text-xl font-bold">Total:</span>
                <span className="text-white text-xl font-bold">RWF {(total * 1.08).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-white">Full Name</Label>
                  <Input
                    id="fullName"
                    value={customerInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-white">Address</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    placeholder="Enter your address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-white">City</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode" className="text-white">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={customerInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      placeholder="ZIP Code"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-4">
                    <RadioGroupItem value="credit_card" id="credit_card" className="text-white" />
                    <Label htmlFor="credit_card" className="text-white flex items-center gap-2 flex-1 cursor-pointer">
                      <CreditCard className="h-5 w-5" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-4">
                    <RadioGroupItem value="mtn_momo" id="mtn_momo" className="text-white" />
                    <Label htmlFor="mtn_momo" className="text-white flex items-center gap-2 flex-1 cursor-pointer">
                      <Smartphone className="h-5 w-5" />
                      MTN Mobile Money
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-pink hover:bg-gradient-purple text-white"
              >
                Continue to Payment
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Loader2, CheckCircle, XCircle } from "lucide-react";
import apiService from '../services/api';

const MtnMomoPayment = ({ order, onPaymentSuccess, onPaymentError }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // If it starts with 250, keep it (max 12 digits: 250 + 9)
    if (digits.startsWith('250')) {
      return digits.slice(0, 12);
    }

    // If it starts with 0, replace with 250 (local format)
    if (digits.startsWith('0')) {
      return '250' + digits.slice(1, 10);
    }

    // If it doesn't start with 250 or 0, assume it's missing country code 250
    if (digits.length > 0 && !digits.startsWith('250')) {
      return '250' + digits.slice(0, 9);
    }
    
    return digits;
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^250\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      onPaymentError('Please enter a valid MTN Rwanda phone number (250XXXXXXXXX)');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const response = await apiService.processMtnMomoPayment({
        orderId: order.id,
        phoneNumber: phoneNumber,
        amount: order.total
      });

      setPaymentId(response.payment.id);
      setPaymentStatus('pending');

      // Poll for payment status
      pollPaymentStatus(response.payment.id);
    } catch (error) {
      console.error('Payment error:', error, error.responseData);
      setPaymentStatus('failed');
      const serverMsg = error.responseData?.error || error.responseData?.details || error.message;
      onPaymentError(serverMsg || 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId) => {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const statusResponse = await apiService.getPaymentStatus(paymentId);
        const status = statusResponse.payment.status;

        if (status === 'completed') {
          setPaymentStatus('success');
          setIsProcessing(false);
          clearInterval(pollInterval);
          onPaymentSuccess(statusResponse.payment);
        } else if (status === 'failed') {
          setPaymentStatus('failed');
          setIsProcessing(false);
          clearInterval(pollInterval);
          onPaymentError('Payment was declined or failed');
        } else if (attempts >= maxAttempts) {
          setPaymentStatus('timeout');
          setIsProcessing(false);
          clearInterval(pollInterval);
          onPaymentError('Payment status check timed out. Please check your payment status later.');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts >= maxAttempts) {
          setPaymentStatus('failed');
          setIsProcessing(false);
          clearInterval(pollInterval);
          onPaymentError('Failed to check payment status');
        }
      }
    }, 10000); // Check every 10 seconds
  };

  const resetPayment = () => {
    setPaymentStatus(null);
    setPaymentId(null);
    setIsProcessing(false);
    setPhoneNumber('');
  };

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          MTN Mobile Money Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!paymentStatus && (
          <>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-white">
                MTN Mobile Money Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="250700000000"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                maxLength={12}
              />
              <p className="text-white/70 text-sm">
                Enter your MTN Rwanda number (format: 250XXXXXXXXX)
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-white">
                <span>Amount to Pay:</span>
                <span className="font-bold">RWF {order.total?.toLocaleString()}</span>
              </div>
              <p className="text-white/80 text-sm">
                You will receive a prompt on your phone to authorize this payment.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              disabled={!validatePhoneNumber(phoneNumber) || isProcessing}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                'Pay with MTN MoMo'
              )}
            </Button>
          </>
        )}

        {paymentStatus === 'processing' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 mx-auto text-yellow-500 animate-spin" />
            <div className="text-white">
              <h3 className="font-semibold">Processing Payment</h3>
              <p className="text-white/80">Sending payment request to MTN MoMo...</p>
            </div>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
            <div className="text-white">
              <h3 className="font-semibold">Waiting for Authorization</h3>
              <p className="text-white/80">
                Please check your phone ({phoneNumber}) and enter your MTN MoMo PIN to authorize the payment.
              </p>
              <p className="text-white/60 text-sm">This may take a few minutes...</p>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div className="text-white">
              <h3 className="font-semibold text-green-400">Payment Successful!</h3>
              <p className="text-white/80">Your payment has been processed successfully.</p>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <div className="text-white">
              <h3 className="font-semibold text-red-400">Payment Failed</h3>
              <p className="text-white/80">The payment could not be processed.</p>
            </div>
            <Button
              onClick={resetPayment}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Try Again
            </Button>
          </div>
        )}

        {paymentStatus === 'timeout' && (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-yellow-500" />
            <div className="text-white">
              <h3 className="font-semibold text-yellow-400">Payment Status Unknown</h3>
              <p className="text-white/80">
                The payment may still be processing. Please check your MTN MoMo transaction history.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={resetPayment}
                variant="outline"
                className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Try Again
              </Button>
              {paymentId && (
                <Button
                  onClick={() => pollPaymentStatus(paymentId)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isProcessing}
                >
                  Check Status
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="text-white/60 text-xs space-y-1">
          <p>• Ensure you have sufficient balance in your MTN MoMo account</p>
          <p>• You will receive an SMS confirmation after successful payment</p>
          <p>• This is a secure payment processed by MTN Mobile Money</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MtnMomoPayment;

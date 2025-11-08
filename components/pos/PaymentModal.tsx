'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, Button, Input, Card, CardContent, Badge } from '@/components/ui';
import { 
  CreditCard, 
  Banknote, 
  Calculator,
  Receipt,
  Check
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  sellPrice: number;
  subtotal: number;
}

// REMOVED: Member interface (member feature removed)

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onPaymentComplete: (transactionId: string) => void;
  // REMOVED: selectedMember prop
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  cart, 
  total, 
  onPaymentComplete,
  // REMOVED: selectedMember 
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  
  // REMOVED: Points redemption state
  // const [usePoints, setUsePoints] = useState(false);
  // const [pointsToRedeem, setPointsToRedeem] = useState<string>('');
  
  // REMOVED: Member discount and points logic
  // All calculations now use simple total
  const finalTotal = total;

  // Auto-fill amount when switching to TRANSFER mode
  const handlePaymentMethodChange = (method: 'CASH' | 'TRANSFER') => {
    setPaymentMethod(method);
    if (method === 'TRANSFER') {
      // Auto-fill with exact total for transfer (after discount)
      setAmountPaid(formatNumberWithDots(finalTotal.toString()));
    } else {
      // Clear amount for cash
      setAmountPaid('');
    }
  };

  // Format number with thousand separators (titik)
  const formatNumberWithDots = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    // Add thousand separators with dots
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Handle amount input with auto-formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatNumberWithDots(inputValue);
    setAmountPaid(formatted);
  };

  // Get numeric value from formatted string
  const getNumericValue = (formattedValue: string): number => {
    return parseFloat(formattedValue.replace(/\./g, '')) || 0;
  };

  const calculateChange = () => {
    const paid = getNumericValue(amountPaid);
    return paid - finalTotal;
  };

  const canProcessPayment = () => {
    // REMOVED: Points redemption validation
    
    // Check payment amount
    if (paymentMethod === 'CASH') {
      return getNumericValue(amountPaid) >= finalTotal;
    } else {
      // For transfer, assume payment is confirmed
      return getNumericValue(amountPaid) >= finalTotal;
    }
  };

  const handlePayment = async () => {
    if (!canProcessPayment()) return;

    setIsProcessing(true);
    try {
      // REMOVED: Points redemption logic
      
      // NextAuth cookies handle authentication automatically
      const response = await fetch('/api/pos/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.sellPrice,
            subtotal: item.subtotal
          })),
          totalAmount: finalTotal,
          originalAmount: total,
          discountAmount: 0, // No member discounts
          paymentMethod,
          amountPaid: getNumericValue(amountPaid),
          customerName: customerName || 'Walk-in Customer',
          // REMOVED: memberId, pointsRedeemed
          change: paymentMethod === 'CASH' ? calculateChange() : 0
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        onPaymentComplete(result.data.transactionId);
        resetForm();
        onClose();
      } else {
        alert('Payment failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Better error messages
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          alert('Session expired. Please login again.');
          window.location.href = '/login';
        } else if (error.message.includes('Failed to fetch')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          alert('Payment failed: ' + error.message);
        }
      } else {
        alert('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmountPaid('');
    setCustomerName('');
    setPaymentMethod('CASH');
    // REMOVED: Points state reset
  };

  // Quick amount buttons - ONLY for CASH mode
  const quickAmountButtons = [
    { label: 'Exact', value: total },
    { label: '2k', value: 2000 },
    { label: '5k', value: 5000 },
    { label: '10k', value: 10000 },
    { label: '20k', value: 20000 },
    { label: '50k', value: 50000 },
    { label: '100k', value: 100000 },
    { label: '200k', value: 200000 },
  ];

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-lg">
        <ModalHeader>
          <ModalTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Process Payment</span>
          </ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              
              {/* REMOVED: Member discount display */}
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">
                  Rp {finalTotal.toLocaleString('id-ID')}
                </span>
              </div>
              
              {/* REMOVED: Member info badge */}
            </CardContent>
          </Card>

          {/* REMOVED: Points Redemption Card */}

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name (Optional)
            </label>
            <Input
              placeholder="Walk-in Customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={paymentMethod === 'CASH' ? 'primary' : 'outline'}
                onClick={() => handlePaymentMethodChange('CASH')}
                className="h-auto py-3"
              >
                <Banknote className="w-4 h-4 mr-2" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === 'TRANSFER' ? 'primary' : 'outline'}
                onClick={() => handlePaymentMethodChange('TRANSFER')}
                className="h-auto py-3"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {paymentMethod === 'TRANSFER' ? 'Transfer Amount' : 'Amount Paid'}
            </label>
            <Input
              type="text"
              placeholder="0"
              value={amountPaid}
              onChange={handleAmountChange}
              className="text-lg"
            />
            
            {/* Quick Amount Buttons - ONLY show for CASH */}
            {paymentMethod === 'CASH' && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {quickAmountButtons.map((button) => (
                  <Button
                    key={button.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmountPaid(formatNumberWithDots(button.value.toString()))}
                    className="text-xs"
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Transfer hint */}
            {paymentMethod === 'TRANSFER' && (
              <p className="text-xs text-gray-500 mt-1">
                Amount auto-filled with exact total. Edit if needed.
              </p>
            )}
          </div>

          {/* Change Calculation - ONLY for CASH */}
          {paymentMethod === 'CASH' && amountPaid && (
            <Card className={`${calculateChange() < 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {calculateChange() < 0 ? 'Insufficient Payment' : 'Change'}:
                  </span>
                  <span className={`text-lg font-bold ${calculateChange() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Rp {Math.abs(calculateChange()).toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Confirmation for Transfer */}
          {paymentMethod === 'TRANSFER' && amountPaid && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Calculator className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Confirm Transfer Payment
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 space-y-1">
                    <p>✓ Ensure transfer amount matches: <span className="font-bold">Rp {total.toLocaleString('id-ID')}</span></p>
                    <p>✓ Verify payment received before completing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!canProcessPayment() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
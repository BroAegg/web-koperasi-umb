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

interface Member {
  id: string;
  name: string;
  tier: string;
  points: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onPaymentComplete: (transactionId: string) => void;
  selectedMember?: Member | null;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  cart, 
  total, 
  onPaymentComplete,
  selectedMember 
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  
  // Points redemption state
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<string>('');
  
  // Helper function for tier discount
  const getTierDiscount = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 10;
      case 'GOLD': return 5;
      case 'SILVER': return 2;
      case 'BRONZE': return 0;
      default: return 0;
    }
  };

  // Calculate points cash value (100 points = Rp 1,000)
  const calculatePointsCashValue = (points: number): number => {
    return Math.floor((points / 100) * 1000);
  };

  // Member discount calculation
  const memberDiscount = selectedMember ? getTierDiscount(selectedMember.tier) : 0;
  const discountAmount = Math.floor((total * memberDiscount) / 100);
  
  // Points redemption calculation
  const pointsRedeemed = usePoints && selectedMember ? parseInt(pointsToRedeem) || 0 : 0;
  const pointsCashValue = calculatePointsCashValue(pointsRedeemed);
  
  // Final total after all discounts
  const finalTotal = total - discountAmount - pointsCashValue;

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
    // Check if points redemption is valid
    if (usePoints && selectedMember) {
      if (pointsRedeemed > selectedMember.points) {
        return false; // Insufficient points
      }
      if (pointsRedeemed <= 0) {
        return false; // No points entered
      }
    }
    
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
      // Get token from localStorage for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Redeem points first if applicable
      if (usePoints && selectedMember && pointsRedeemed > 0) {
        const redeemResponse = await fetch('/api/members/points/redeem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            memberId: selectedMember.id,
            points: pointsRedeemed,
            description: `Penukaran ${pointsRedeemed} poin untuk diskon`
          }),
        });

        const redeemResult = await redeemResponse.json();
        if (!redeemResult.success) {
          throw new Error(redeemResult.error || 'Failed to redeem points');
        }
      }

      const response = await fetch('/api/pos/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
          discountAmount: discountAmount + pointsCashValue,
          paymentMethod,
          amountPaid: getNumericValue(amountPaid),
          customerName: customerName || 'Walk-in Customer',
          memberId: selectedMember?.id,
          pointsRedeemed: pointsRedeemed,
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
    setUsePoints(false);
    setPointsToRedeem('');
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
              
              {/* Member discount display */}
              {selectedMember && (
                <>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal:</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Tier Discount ({memberDiscount}%):</span>
                      <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {pointsCashValue > 0 && (
                    <div className="flex justify-between text-sm text-purple-600 font-medium">
                      <span>Points Redeemed ({pointsRedeemed} pts):</span>
                      <span>- Rp {pointsCashValue.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                </>
              )}
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">
                  Rp {finalTotal.toLocaleString('id-ID')}
                </span>
              </div>
              
              {selectedMember && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-amber-900">
                      💰 Member: {selectedMember.name}
                    </div>
                    <div className="text-amber-800 font-bold">
                      {selectedMember.points.toLocaleString('id-ID')} pts
                    </div>
                  </div>
                  <div className="text-amber-700 mt-1">
                    Will earn: ~{Math.floor(finalTotal * 0.01)} pts
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Points Redemption - Only for members */}
          {selectedMember && selectedMember.points > 0 && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => {
                        setUsePoints(e.target.checked);
                        if (!e.target.checked) setPointsToRedeem('');
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-purple-900">
                      🎁 Use Points for Discount
                    </span>
                  </label>
                  <span className="text-xs text-purple-700 font-medium">
                    Available: {selectedMember.points.toLocaleString('id-ID')} pts
                  </span>
                </div>

                {usePoints && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter points"
                        value={pointsToRedeem}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const maxPoints = Math.min(
                            selectedMember.points,
                            Math.floor((total - discountAmount) / 10) * 100 // Can't exceed remaining total
                          );
                          setPointsToRedeem(Math.min(value, maxPoints).toString());
                        }}
                        max={selectedMember.points}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const maxPoints = Math.min(
                            selectedMember.points,
                            Math.floor((total - discountAmount) / 10) * 100
                          );
                          setPointsToRedeem(maxPoints.toString());
                        }}
                        className="whitespace-nowrap"
                      >
                        Use Max
                      </Button>
                    </div>
                    {pointsRedeemed > 0 && (
                      <div className="text-sm bg-white rounded p-2 border border-purple-200">
                        <div className="flex justify-between text-purple-700">
                          <span>{pointsRedeemed.toLocaleString('id-ID')} points</span>
                          <span className="font-bold">
                            = Rp {pointsCashValue.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                          Rate: 100 points = Rp 1,000
                        </div>
                      </div>
                    )}
                    {pointsRedeemed > selectedMember.points && (
                      <div className="text-xs text-red-600">
                        ⚠️ Insufficient points balance
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
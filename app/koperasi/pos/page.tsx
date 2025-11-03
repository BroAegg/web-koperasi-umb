'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/use-auth';
import { useNotification } from '@/lib/notification-context';
import { useOrientation } from '@/hooks/useOrientation';
import { Card, CardHeader, CardContent, Button, Input, Badge } from '@/components/ui';

// LAZY LOAD heavy components for faster initial page load
const PaymentModal = dynamic(() => import('@/components/pos/PaymentModal').then(mod => ({ default: mod.PaymentModal })), {
  loading: () => <div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const QuickTransactionHistory = dynamic(() => import('@/components/pos/QuickTransactionHistory'), {
  loading: () => <div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  CreditCard,
  Receipt,
  Package,
  Zap,
  CheckCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  stock: number;
  unit: string;
  category: string;
  sku?: string;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const { user, loading } = useAuth(['ADMIN', 'SUPER_ADMIN']);
  const { success, error } = useNotification();
  const orientation = useOrientation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);
  const [refreshTransactions, setRefreshTransactions] = useState(0);

  // Fetch products for POS
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) {
        const activeProducts = result.data.filter((p: Product) => p.stock > 0);
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Filter products based on search and category - OPTIMIZED with useMemo
  const memoizedFilteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    return filtered;
  }, [searchTerm, selectedCategory, products]);

  // Sync to state for backward compatibility
  useEffect(() => {
    setFilteredProducts(memoizedFilteredProducts);
  }, [memoizedFilteredProducts]);

  // OPTIMIZED with useCallback
  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1, subtotal: item.sellPrice * (item.quantity + 1) }
              : item
          );
        }
        return prevCart;
      } else {
        const newItem: CartItem = {
          ...product,
          quantity: 1,
          subtotal: product.sellPrice
        };
        return [...prevCart, newItem];
      }
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      return;
    }

    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.sellPrice * newQuantity
        };
      }
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const getCartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const handlePaymentComplete = (transactionId: string) => {
    setLastTransactionId(transactionId);
    clearCart();
    // Trigger transaction list refresh (real-time update)
    setRefreshTransactions(prev => prev + 1);
    // Show success notification (non-blocking, auto-dismiss in 2 seconds for busy cashiers)
    success(
      'Transaksi Berhasil!',
      `Receipt: ${transactionId.slice(-8).toUpperCase()}`
    );
  };

  const categories = ['ALL', 'Sembako', 'Minuman', 'Makanan Ringan', 'Gorengan'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - TABLET OPTIMIZED */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Point of Sale</h1>
              <p className="text-sm md:text-base text-gray-600">Cashier: {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Badge variant="outline" className="text-xs md:text-sm">
              {products.length} Products Available
            </Badge>
            <Badge variant="outline" className="text-xs md:text-sm">
              {cart.length} Items in Cart
            </Badge>
          </div>
        </div>

        {/* ORIENTATION AWARE LAYOUT: Portrait = stacked, Landscape = side-by-side */}
        <div className={`grid gap-4 md:gap-6 ${
          orientation === 'landscape' 
            ? 'grid-cols-1 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {/* Left Side - Product Search & Selection */}
          <div className={`space-y-3 md:space-y-4 ${
            orientation === 'landscape' ? 'lg:col-span-2' : ''
          }`}>
            {/* Search Bar - TABLET OPTIMIZED */}
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 md:h-4 md:w-4 text-gray-400" />
                    <Input
                      placeholder="Search products by name or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 md:pl-10 h-12 md:h-10 text-base"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 md:px-3 py-3 md:py-2 border border-gray-300 rounded-md h-12 md:h-auto text-base touch-manipulation"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'ALL' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid - TABLET OPTIMIZED */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex justify-between items-start mb-2 md:mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-sm leading-tight">
                          {product.name}
                        </h3>
                        {product.sku && (
                          <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center gap-2">
                      <div>
                        <p className="text-base md:texpt-lg font-bold text-blue-600">
                          Rp {product.sellPrice.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {product.stock} {product.unit}
                        </p>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="flex items-center space-x-2 min-h-12 touch-manipulation shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <Package className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Try adjusting your search or category filter
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Shopping Cart - TABLET OPTIMIZED */}
          <div className="space-y-3 md:space-y-4">
            <Card>
              <CardHeader className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-semibold flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart ({cart.length})</span>
                  </h3>
                  {cart.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={clearCart}
                      className="text-red-600 min-h-12 min-w-12 touch-manipulation"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {cart.length === 0 ? (
                  <div className="p-4 md:p-6 text-center">
                    <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-sm md:text-base text-gray-500">Cart is empty</p>
                    <p className="text-xs md:text-sm text-gray-400">Add products to get started</p>
                  </div>
                ) : (
                  <div className="max-h-80 md:max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="p-3 md:p-4 border-b border-gray-200 last:border-b-0">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-sm md:text-sm text-gray-900 flex-1 pr-2">
                            {item.name}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 min-h-10 min-w-10 p-2 border-red-200 hover:bg-red-50 touch-manipulation shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-2 md:space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="min-h-10 min-w-10 p-0 touch-manipulation"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 md:w-10 text-center text-base font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="min-h-10 min-w-10 p-0 touch-manipulation"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm md:text-sm font-semibold whitespace-nowrap">
                              Rp {item.subtotal.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              @ Rp {item.sellPrice.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cart Total & Checkout - TABLET OPTIMIZED */}
            {cart.length > 0 && (
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center text-base md:text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        Rp {getCartTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full min-h-14 text-base md:text-lg font-semibold touch-manipulation"
                      onClick={() => setShowPaymentModal(true)}
                      disabled={isProcessingPayment}
                    >
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                      Process Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Transaction History */}
        <QuickTransactionHistory refreshTrigger={refreshTransactions} />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          cart={cart}
          total={getCartTotal}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
}
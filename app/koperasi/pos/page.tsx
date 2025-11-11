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

// REMOVED: Member interface (member feature removed from POS)

export default function POSPage() {
  const { user, loading } = useAuth(['ADMIN', 'SUPER_ADMIN', 'KASIR']);
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
  
  // Member loyalty state - REMOVED
  // const [members, setMembers] = useState<Member[]>([]);
  // const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  // const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Fetch products for POS
  useEffect(() => {
    fetchProducts();
    // fetchMembers(); // REMOVED
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

  // REMOVED: fetchMembers function
  // const fetchMembers = async () => {
  //   try {
  //     const response = await fetch('/api/members');
  //     const result = await response.json();
  //     if (result.success) {
  //       const activeMembers = result.data.filter((m: any) => m.isActive);
  //       setMembers(activeMembers);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching members:', error);
  //   }
  // };

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

  // Barcode Scanner Integration - Listen for rapid keyboard input
  useEffect(() => {
    let barcode = '';
    let timeout: NodeJS.Timeout;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Clear timeout to detect rapid scanning
      if (timeout) clearTimeout(timeout);
      
      // Enter key = barcode scan complete
      if (e.key === 'Enter' && barcode.length > 0) {
        e.preventDefault();
        // Search product by SKU or name
        const product = products.find(p => 
          p.sku?.toLowerCase() === barcode.toLowerCase() ||
          p.name.toLowerCase().includes(barcode.toLowerCase())
        );
        
        if (product) {
          addToCart(product);
          success('Produk Ditambahkan', `${product.name} berhasil di-scan`);
        } else {
          error('Produk Tidak Ditemukan', `SKU/Barcode: ${barcode}`);
        }
        
        barcode = '';
        return;
      }
      
      // Accumulate barcode characters (rapid input from scanner)
      if (e.key.length === 1) { // Single character
        barcode += e.key;
        
        // Reset after 100ms of no input (human typing is slower)
        timeout = setTimeout(() => {
          barcode = '';
        }, 100);
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeout) clearTimeout(timeout);
    };
  }, [products, addToCart, success, error]);

  const categories = ['ALL', 'Sembako', 'Minuman', 'Makanan Ringan', 'Gorengan'];

  // REMOVED: Member tier helper functions
  // const getTierIcon = (tier: string) => { ... }
  // const getTierDiscount = (tier: string) => { ... }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-3 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - TABLET OPTIMIZED */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 md:mb-7 gap-3 md:gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg shadow-blue-200">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Point of Sale</h1>
              <p className="text-sm md:text-base text-slate-600">Cashier: {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Badge variant="outline" className="text-xs md:text-sm bg-white shadow-sm border-slate-200">
              {products.length} Products Available
            </Badge>
            <Badge variant="outline" className="text-xs md:text-sm bg-white shadow-sm border-slate-200">
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
            {/* REMOVED: Member Selection Card */}

            {/* Search Bar - TABLET OPTIMIZED */}
            <Card className="shadow-md border-slate-200">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Search products by name or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      className="pl-11 h-14 text-base border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-4 border border-slate-300 rounded-xl h-14 text-base touch-manipulation bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm font-medium text-slate-700"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer border-slate-200 shadow-md bg-white">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-base md:text-base leading-tight mb-1">
                          {product.name}
                        </h3>
                        {product.sku && (
                          <p className="text-xs text-slate-500 mt-1 font-medium">SKU: {product.sku}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-lg md:text-xl font-bold text-blue-600 mb-1">
                          Rp {product.sellPrice.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Stock: <span className="text-green-600 font-semibold">{product.stock}</span> {product.unit}
                        </p>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="flex items-center space-x-2 min-h-12 touch-manipulation shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline font-semibold">Add</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card className="shadow-md border-slate-200">
                <CardContent className="p-8 md:p-10 text-center">
                  <div className="bg-slate-100 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-4 md:mb-5">
                    <Package className="w-12 h-12 md:w-14 md:h-14 text-slate-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-sm md:text-base text-slate-600">
                    Try adjusting your search or category filter
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Shopping Cart - TABLET OPTIMIZED */}
          <div className="space-y-4 md:space-y-5">
            <Card className="shadow-lg border-slate-200 bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-bold flex items-center space-x-2 text-slate-900">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                    <span>Cart ({cart.length})</span>
                  </h3>
                  {cart.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={clearCart}
                      className="text-red-600 min-h-12 min-w-12 touch-manipulation border-red-300 hover:bg-red-50 shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {cart.length === 0 ? (
                  <div className="p-6 md:p-8 text-center">
                    <ShoppingCart className="w-12 h-12 md:w-14 md:h-14 text-slate-300 mx-auto mb-4 md:mb-5" />
                    <p className="text-base md:text-lg text-slate-600 font-semibold mb-1">Cart is empty</p>
                    <p className="text-sm md:text-base text-slate-400">Add products to get started</p>
                  </div>
                ) : (
                  <div className="max-h-80 md:max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="p-4 md:p-5 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-sm md:text-base text-slate-900 flex-1 pr-2 leading-tight">
                            {item.name}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 min-h-10 min-w-10 p-2 border-red-200 hover:bg-red-50 touch-manipulation shrink-0 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 md:space-x-3 bg-slate-100 rounded-lg p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="min-h-10 min-w-10 p-0 touch-manipulation bg-white shadow-sm hover:shadow-md"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center text-base font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="min-h-10 min-w-10 p-0 touch-manipulation bg-white shadow-sm hover:shadow-md"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base md:text-lg font-bold whitespace-nowrap text-blue-600">
                              Rp {item.subtotal.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-slate-500 whitespace-nowrap font-medium">
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
              <Card className="shadow-lg border-slate-200 bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <CardContent className="p-5 md:p-6">
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                      <span className="text-lg md:text-xl font-bold text-slate-700">Total:</span>
                      <span className="text-xl md:text-2xl font-black text-blue-600">
                        Rp {getCartTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full min-h-16 text-lg md:text-xl font-bold touch-manipulation bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => setShowPaymentModal(true)}
                      disabled={isProcessingPayment}
                    >
                      <CreditCard className="w-6 h-6 md:w-7 md:h-7 mr-3" />
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
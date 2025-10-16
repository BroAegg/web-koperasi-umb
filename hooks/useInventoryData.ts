// Hook for fetching inventory data (products, categories, suppliers)

import { useState, useEffect } from 'react';
import { Product, Category, Supplier } from '@/types/inventory';
import { useNotification } from '@/lib/notification-context';

export function useInventoryData(selectedDate: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useNotification();

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      error('Error', 'Gagal memuat data produk');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      error('Error', 'Gagal memuat data kategori');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (err) {
      error('Error', 'Gagal memuat data supplier');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSuppliers(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [selectedDate]);

  return {
    products,
    categories,
    suppliers,
    loading,
    refetchProducts: fetchProducts,
    setProducts,
  };
}

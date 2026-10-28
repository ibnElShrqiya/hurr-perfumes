import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  Coupon,
  GovernorateShipping,
  ProductCategory,
  ShippingStatus,
  PaymentStatus,
} from '../types';
import { EGYPTIAN_GOVERNORATES, FREE_SHIPPING_THRESHOLD } from '../data/governorates';
import { supabase, fromDbProduct, toDbProduct, fromDbCoupon, fromDbOrder } from '../lib/supabase';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface StoreContextType {
  // Products
  products: Product[];
  activeCategory: ProductCategory | 'all';
  setActiveCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFamily: string;
  setSelectedFamily: (fam: string) => void;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating';
  setSortBy: (sort: 'featured' | 'price_asc' | 'price_desc' | 'rating') => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Checkout & Pricing
  selectedGovernorate: GovernorateShipping;
  setSelectedGovernorateById: (id: string) => void;
  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  isFreeShipping: boolean;
  freeShippingProgress: number; // 0 to 100%

  // Orders
  orders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'trackingHistory'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, shippingStatus: ShippingStatus, paymentStatus?: PaymentStatus) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByPhone: (phone: string) => Order[];
  trackOrder: (id: string, token: string) => Promise<Order | null>;

  // Admin
  isAdminLoggedIn: boolean;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (productId: string) => void;
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  toggleCouponStatus: (code: string) => void;
  deleteCoupon: (code: string) => void;

  // Modals & UI
  isQuizOpen: boolean;
  setIsQuizOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Production catalog is sourced from Supabase only. Never display seeded/demo products.
  const [products, setProducts] = useState<Product[]>([]);

  // Admin role lookup supports the deployed schema's admin_roles table and the optional profiles table.
  const getAdminRole = async (userId: string): Promise<string | null> => {
    if (!supabase) return null;
    const { data: adminRole, error: adminRoleError } = await supabase
      .from('admin_roles').select('role').eq('user_id', userId).maybeSingle();
    if (!adminRoleError && adminRole?.role) return adminRole.role;
    if (adminRoleError) console.error('[HUR admin] Could not read public.admin_roles:', adminRoleError.message, adminRoleError.code);
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('role').eq('user_id', userId).maybeSingle();
    if (!profileError && profile?.role) return profile.role;
    if (profileError) console.warn('[HUR admin] Optional public.profiles lookup failed:', profileError.message, profileError.code);
    return null;
  };

  // Save products on change
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const load = async () => {
      const [{ data: productRows }, { data: couponRows }, { data: orderRows }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*,order_items(*)').order('created_at', { ascending: false }),
      ]);
      if (!alive) return;
      if (productRows) setProducts(productRows.map(fromDbProduct));
      if (couponRows) setCoupons(couponRows.map(fromDbCoupon));
      if (orderRows) setOrders(orderRows.map(fromDbOrder));
    };
    const checkAdmin = async (session: any) => {
      if (!session) { setIsAdminLoggedIn(false); return; }
      const role = await getAdminRole(session.user.id);
      if (alive) setIsAdminLoggedIn(role === 'admin');
      if (role === 'admin') {
        let [{ data: products }, { data: coupons }, { data: orders }] = await Promise.all([
          supabase!.from('products').select('*').order('created_at', { ascending: false }),
          supabase!.from('coupons').select('*').order('created_at', { ascending: false }),
          supabase!.from('orders').select('*,order_items(*)').order('created_at', { ascending: false }),
        ]);
        // Empty database stays empty until the store owner adds real products/coupons.
        if (alive) { if (products) setProducts(products.map(fromDbProduct)); if (coupons) setCoupons(coupons.map(fromDbCoupon)); if (orders) setOrders(orders.map(fromDbOrder)); }
      }
    };
    void load();
    void supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) return checkAdmin(data.session);
      const { data: anonymous } = await supabase!.auth.signInAnonymously();
      return checkAdmin(anonymous.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void checkAdmin(session); });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hurr_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('hurr_cart_v2', JSON.stringify(cart));
  }, [cart]);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hurr_wishlist_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('hurr_wishlist_v2', JSON.stringify(wishlist));
  }, [wishlist]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);


  // Governorate
  const [selectedGovernorate, setSelectedGovernorate] = useState<GovernorateShipping>(
    EGYPTIAN_GOVERNORATES[0] // Cairo default
  );

  // Active coupon
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Navigation & Filtering
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) { showToast('أضف إعدادات Supabase أولاً لتفعيل لوحة الإدارة', 'error'); return false; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { showToast('تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور وصلاحية المدير.', 'error'); return false; }
    const { data } = await supabase.auth.getUser();
    const role = data.user?.id ? await getAdminRole(data.user.id) : null;
    if (role !== 'admin') { await supabase.auth.signOut(); showToast('تم تسجيل الدخول لكن الحساب غير مخوّل للإدارة. تحقق من جدول admin_roles وصلاحيات القراءة.', 'error'); return false; }
    setIsAdminLoggedIn(true); showToast('تم تسجيل الدخول إلى لوحة حُرّ', 'success'); return true;
  };

  const logoutAdmin = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
    showToast('تم تسجيل الخروج من لوحة التحكم', 'info');
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    if (product.stock <= 0) {
      showToast('عذراً، هذا العطر نفد مؤقتاً من المخزن', 'error');
      return;
    }

    const size = selectedSize || product.volume;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`الكمية المتاحة حالياً في المخزن هي ${product.stock} قطع فقط`, 'warning');
          return prev;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [...prev, { productId: product.id, product, quantity, selectedSize: size }];
      }
    });

    showToast(`تمت إضافة "${product.nameAr}" إلى سلة مشترياتك`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    showToast('تم حذف المنتج من السلة', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (quantity > item.product.stock) {
            showToast(`أقصى كمية متوفرة هي ${item.product.stock} قطع`, 'warning');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('تمت إزالة العطر من قائمة الرغبات', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('تم حفظ العطر في قائمة رغباتك', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Governorate setter
  const setSelectedGovernorateById = (id: string) => {
    const gov = EGYPTIAN_GOVERNORATES.find((g) => g.id === id);
    if (gov) {
      setSelectedGovernorate(gov);
    }
  };

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discountAmount = 0;
  if (activeCoupon) {
    if (subtotal >= activeCoupon.minOrderAmount) {
      if (activeCoupon.discountType === 'percentage') {
        discountAmount = Math.round((subtotal * activeCoupon.value) / 100);
      } else {
        discountAmount = Math.min(subtotal, activeCoupon.value);
      }
    }
  }

  const isFreeShipping = subtotal - discountAmount >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : selectedGovernorate.fee;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  // Coupons
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!found) {
      return { success: false, message: 'كود الخصم غير صحيح أو منتهي الصلاحية' };
    }

    if (subtotal < found.minOrderAmount) {
      return {
        success: false,
        message: `هذا الكوبون يتطلب حداً أدنى للطلب بقيمة ${found.minOrderAmount} ج.م`,
      };
    }

    setActiveCoupon(found);
    return { success: true, message: `تم تفعيل كوبون الخصم: ${found.description}` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    showToast('تم إلغاء كود الخصم', 'info');
  };

  // Atomic Order Placement
  const placeOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt' | 'trackingHistory'>
  ): Promise<Order> => {
    if (!supabase) throw new Error('المتجر غير متصل بقاعدة الطلبات الآمنة. يرجى المحاولة لاحقاً.');
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) {
      const { data, error: authError } = await supabase.auth.signInAnonymously();
      if (authError || !data.session) throw new Error('تعذر إنشاء جلسة آمنة للطلب. تحقق من تفعيل الدخول المجهول في Supabase.');
    }
    const { data, error } = await supabase.functions.invoke('create-order', { body: {
      customerName: orderData.customerName, customerPhone: orderData.customerPhone.replace(/\s/g, ''),
      customerEmail: orderData.customerEmail, governorate: orderData.governorate, city: orderData.city,
      detailedAddress: orderData.detailedAddress, notes: orderData.notes, paymentMethod: orderData.paymentMethod,
      couponCode: orderData.couponCode,
      items: orderData.items.map((item) => ({ productId: item.productId, quantity: item.quantity, selectedSize: item.selectedSize })),
    } });
    if (error || !data?.id || !data?.trackingToken) {
      let serverMessage = data?.error as string | undefined;
      // Supabase wraps non-2xx Edge Function responses; extract the JSON message when possible.
      const context = (error as any)?.context;
      if (!serverMessage && context && typeof context.json === 'function') {
        try { const body = await context.clone().json(); serverMessage = body?.error || body?.message; } catch { /* response may not be JSON */ }
      }
      const message = error?.message || '';
      console.error('[HUR checkout] create-order failed', { message, serverMessage, status: context?.status, code: (error as any)?.name });
      if (message.toLowerCase().includes('failed to send a request') || (error as any)?.name === 'FunctionsFetchError') {
        throw new Error('تعذر الاتصال بخدمة الطلبات. تحقق من نشر الدالة create-order في Supabase، ومن صحة رابط المشروع ومفتاح النشر في إعدادات الموقع.');
      }
      if (context?.status === 401 || context?.status === 403) {
        throw new Error('خدمة الطلبات رفضت الاتصال. تحقق من إعدادات التحقق من JWT ونشر دالة create-order في Supabase.');
      }
      throw new Error(serverMessage || 'تعذر حفظ الطلب. راجع سجلات Supabase > Edge Functions > create-order لمعرفة السبب.');
    }

    const newOrder: Order = {
      ...orderData,
      id: data.id,
      subtotal: Number(data.subtotal), shippingFee: Number(data.shippingFee), discountAmount: Number(data.discountAmount), totalAmount: Number(data.totalAmount),
      items: (data.items || []).map((item: any) => ({ productId: item.productId, productName: item.productName, productImage: item.productImage, quantity: item.quantity, unitPrice: Number(item.unitPrice), totalPrice: Number(item.totalPrice), selectedSize: item.selectedSize })),
      createdAt: new Date().toISOString(),
      trackingToken: data.trackingToken,
      trackingHistory: [
        {
          status: 'new',
          label: 'تم استلام وتأكيد الطلب',
          date: 'الآن',
          description: 'تم تسجيل طلبك في نظام دار حُرّ وسيقوم قسم المبيعات بمراجعته فوراً',
          completed: true,
        },
        {
          status: 'processing',
          label: 'قيد التجهيز في مشغل العطور',
          date: 'خلال 4 ساعات',
          description: 'تعطير وتغليف الزجاجات الفاخرة وختم علبة الإهداء بالختم المذهب وإرفاق العينة المجانية',
          completed: false,
        },
        {
          status: 'shipped',
          label: 'خرج للشحن مع المندوب',
          date: selectedGovernorate.estimatedDelivery,
          description: `تسليم الشحنة لشركة التوصيل السريع المتجهة إلى ${orderData.governorate}`,
          completed: false,
        },
        {
          status: 'delivered',
          label: 'تم التسليم بنجاح',
          date: 'عند الوصول',
          description: 'فحص المنتج مع المندوب واستلام فاتورة الشراء المعتمدة',
          completed: false,
        },
      ],
    };

    window.localStorage.setItem(`hurr_track_${newOrder.id}`, data.trackingToken);
    setProducts((prev) => prev.map((p) => { const item = orderData.items.find((i) => i.productId === p.id); return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p; }));
    if (activeCoupon) setActiveCoupon(null);

    // Add to orders list
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart
    clearCart();

    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    shippingStatus: ShippingStatus,
    paymentStatus?: PaymentStatus
  ): Promise<void> => {
    if (!supabase || !isAdminLoggedIn) throw new Error('يلزم تسجيل دخول المدير');
    const update: Record<string, string> = { shipping_status: shippingStatus };
    if (paymentStatus) update.payment_status = paymentStatus;
    const { error } = await supabase.from('orders').update(update).eq('id', orderId);
    if (error) throw error;
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedHistory = order.trackingHistory.map((step) => {
            if (step.status === shippingStatus) {
              return { ...step, completed: true, date: 'تم التحديث الآن' };
            }
            return step;
          });

          return {
            ...order,
            shippingStatus,
            paymentStatus: paymentStatus || order.paymentStatus,
            trackingHistory: updatedHistory,
          };
        }
        return order;
      })
    );
    showToast(`تم تحديث حالة الطلب ${orderId} إلى: ${shippingStatus}`, 'success');
  };

  const getOrderById = (orderId: string) => {
    const clean = orderId.trim().toUpperCase();
    return orders.find((o) => o.id.toUpperCase() === clean);
  };

  const getOrdersByPhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return orders.filter((o) => o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone));
  };

  const trackOrder = async (id: string, token: string): Promise<Order | null> => {
    if (!supabase || !id.trim() || token.length < 32) return null;
    const { data, error } = await supabase.functions.invoke('track-order', { body: { id: id.trim().toUpperCase(), trackingToken: token } });
    if (error || !data?.id) return null;
    return { id: data.id, customerName: '', customerPhone: '', governorate: '', city: '', detailedAddress: '',
      paymentStatus: data.paymentStatus, shippingStatus: data.shippingStatus,
      subtotal: Number(data.subtotal || 0), shippingFee: Number(data.shippingFee || 0), discountAmount: Number(data.discountAmount || 0), totalAmount: Number(data.totalAmount || 0),
      paymentMethod: data.paymentMethod || 'cod', items: (data.items || []).map((i: any) => ({ productId: '', productName: i.productName, productImage: '', quantity: i.quantity, unitPrice: Number(i.unitPrice || 0), totalPrice: Number(i.totalPrice || 0), selectedSize: i.selectedSize })),
      createdAt: data.createdAt, trackingHistory: data.trackingHistory || [] };
  };

  // Admin Product Mutations
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<boolean> => {
    if (!supabase || !isAdminLoggedIn) { showToast('يلزم اتصال قاعدة البيانات وتسجيل دخول المدير لحفظ المنتج.', 'error'); return false; }
    const draftProduct: Product = {
      ...productData,
      id: '', // Supabase generates the UUID primary key.
      createdAt: new Date().toISOString(),
    };
    const { data: savedRow, error } = await supabase.from('products')
      .insert(toDbProduct(draftProduct)).select('*').single();
    if (error || !savedRow) { showToast(error?.message || 'تعذر حفظ المنتج في قاعدة البيانات.', 'error'); return false; }
    const savedProduct = fromDbProduct(savedRow);
    setProducts((prev) => [savedProduct, ...prev]);
    showToast(`تمت إضافة العطر "${savedProduct.nameAr}" بنجاح`, 'success');
    return true;
  };

  const updateProduct = async (updated: Product): Promise<boolean> => {
    if (!supabase || !isAdminLoggedIn) { showToast('يلزم اتصال قاعدة البيانات وتسجيل دخول المدير لتعديل المنتج.', 'error'); return false; }
    const { data: savedRow, error } = await supabase.from('products')
      .update(toDbProduct(updated)).eq('id', updated.id).select('*').single();
    if (error || !savedRow) { showToast(error?.message || 'تعذر تحديث المنتج في قاعدة البيانات.', 'error'); return false; }
    const savedProduct = fromDbProduct(savedRow);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? savedProduct : p)));
    showToast(`تم تحديث بيانات العطر "${savedProduct.nameAr}"`, 'success');
    return true;
  };

  const deleteProduct = async (productId: string) => {
    if (!supabase || !isAdminLoggedIn) { showToast('يلزم اتصال قاعدة البيانات وتسجيل دخول المدير لحذف المنتج.', 'error'); return; }
    if (supabase) { const { error } = await supabase.from('products').delete().eq('id', productId); if (error) { showToast(error.message, 'error'); return; } }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('تم حذف المنتج من المتجر', 'info');
  };

  // Admin Coupon Mutations
  const addCoupon = async (coupon: Coupon) => {
    if (!supabase || !isAdminLoggedIn) { showToast('يلزم اتصال قاعدة البيانات وتسجيل دخول المدير لإضافة كوبون.', 'error'); return; }
    if (supabase) { const { error } = await supabase.from('coupons').insert({ code: coupon.code, discount_type: coupon.discountType, value: coupon.value, min_order_amount: coupon.minOrderAmount, is_active: coupon.isActive, usage_count: coupon.usageCount, description: coupon.description }); if (error) { showToast(error.message, 'error'); return; } }
    setCoupons((prev) => [coupon, ...prev]);
    showToast(`تمت إضافة كود الخصم "${coupon.code}"`, 'success');
  };

  const toggleCouponStatus = async (code: string) => {
    if (!supabase || !isAdminLoggedIn) { showToast('يلزم اتصال قاعدة البيانات وتسجيل دخول المدير لتعديل الكوبون.', 'error'); return; }
    const current = coupons.find((c) => c.code === code); if (!current) return;
    if (supabase) { const { error } = await supabase.from('coupons').update({ is_active: !current.isActive }).eq('code', code); if (error) { showToast(error.message, 'error'); return; } }
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const deleteCoupon = async (code: string) => {
    if (!supabase || !isAdminLoggedIn) { showToast('يلزم اتصال قاعدة البيانات وتسجيل دخول المدير لحذف الكوبون.', 'error'); return; }
    if (supabase) { const { error } = await supabase.from('coupons').delete().eq('code', code); if (error) { showToast(error.message, 'error'); return; } }
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast('تم حذف كود الخصم', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        selectedFamily,
        setSelectedFamily,
        sortBy,
        setSortBy,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        selectedGovernorate,
        setSelectedGovernorateById,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        isFreeShipping,
        freeShippingProgress,
        orders,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        getOrdersByPhone,
        trackOrder,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        coupons,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        isQuizOpen,
        setIsQuizOpen,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

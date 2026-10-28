// Admin Coupon Mutations
const addCoupon = async (coupon: Coupon): Promise<void> => {
  if (!supabase || !isAdminLoggedIn) {
    showToast(
      'يلزم اتصال قاعدة البيانات وتسجيل دخول المدير لإضافة كوبون.',
      'error'
    );
    return;
  }

  // قاعدة البيانات الحالية تدعم الخصم بالنسبة المئوية فقط.
  if (
    coupon.discountType !== 'percentage' ||
    !Number.isFinite(Number(coupon.value)) ||
    Number(coupon.value) <= 0 ||
    Number(coupon.value) > 100
  ) {
    showToast(
      'الكوبون لازم يكون خصمًا بالنسبة المئوية من 1 إلى 100%.',
      'error'
    );
    return;
  }

  const code = coupon.code.trim().toUpperCase();

  if (!code) {
    showToast('أدخل كود كوبون صحيحًا.', 'error');
    return;
  }

  // الأعمدة المتوافقة مع جدول coupons الحالي:
  // id, code, discount_percent, is_active, expires_at, created_at
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code,
      discount_percent: Number(coupon.value),
      is_active: Boolean(coupon.isActive),
      expires_at: null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[HURR] Failed to add coupon:', error);
    showToast(`تعذرت إضافة الكوبون: ${error.message}`, 'error');
    return;
  }

  const savedCoupon: Coupon = {
    ...coupon,
    code: data.code,
    discountType: 'percentage',
    value: Number(data.discount_percent),
    isActive: Boolean(data.is_active),
    description: `خصم ${Number(data.discount_percent)}%`,
  };

  setCoupons((prev) => [
    savedCoupon,
    ...prev.filter((item) => item.code !== savedCoupon.code),
  ]);

  showToast(`تمت إضافة كود الخصم "${savedCoupon.code}" بنجاح`, 'success');
};

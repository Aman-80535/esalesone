'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@/context/AuthProvider';
import { isAdminEmail } from '@/utils/admin';
import { fetchUserData } from '@/redux/user/userActions';
import '../styles/admin.css';

const navItems = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/products', label: '📦 Products' },
  { href: '/admin/orders', label: '🛍️ Orders' },
  { href: '/admin/users', label: '👥 Users' },
  { href: '/admin/coupons', label: '🏷️ Coupons' },
  { href: '/admin/categories', label: '📂 Categories' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { userData, token } = useSelector((s) => s.user);
  const { user, loading } = useAuth();

  const email = userData?.email || user?.email;
  const isAdmin = isAdminEmail(email, userData);

  useEffect(() => {
    if (token && !userData) {
      dispatch(fetchUserData());
    }
  }, [token, userData, dispatch]);

  useEffect(() => {
    if (loading) return;
    if (!token && !user) {
      router.replace('/auth/login?redirect=/admin');
      return;
    }
    if (email && !isAdminEmail(email, userData)) {
      // In development or if user is logged in, check if allowed
      console.warn('Access verification:', email, 'isAdmin:', isAdmin);
    }
  }, [loading, token, user, email, userData, router, isAdmin]);

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/shopi-logo.png" alt="LIBAAS" />
          <span>Shopi Admin</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="admin-back">
          ← Back to Storefront
        </Link>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

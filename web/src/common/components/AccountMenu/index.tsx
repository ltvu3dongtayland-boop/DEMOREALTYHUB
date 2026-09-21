'use client';

import { useState } from 'react';
import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

import {
  FiLogOut,
  FiSettings,
  FiShoppingCart,
  FiUser,
  FiUserCheck,
} from 'react-icons/fi';

import {
  hasAdminAccess,
  useCurrentUser,
  useLogout,
  type UserRole,
} from '@/common/auth/userStore';
import { ADMIN_URL, neverChanges } from './types';
import { useAccountMenu } from './useAccountMenu';
import Divider from './Divider';
import LangSwitcher from './LangSwitcher';
import LoginButton from './LoginButton';
import MenuHeader from './MenuHeader';
import MenuItem from './MenuItem';
import UserTrigger from './UserTrigger';

const AccountMenu = () => {
  const pathname = usePathname();
  const user = useCurrentUser();
  const logout = useLogout();
  const { isOpen, toggle, close, containerRef } = useAccountMenu();
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const isMounted = useSyncExternalStore(neverChanges, () => true, () => false);

  // Redirect to login page if on login route
  if (pathname === '/login') return null;

  // SSR-safe: render placeholder until mounted on client
  if (!isMounted) {
    return (
      <div className="flex h-9 items-center" aria-hidden>
        <span className="h-9 w-9 rounded-full bg-gray-100" />
      </div>
    );
  }

  // Not logged in: show login button
  if (!user) {
    return <LoginButton />;
  }

  const canAdmin = hasAdminAccess(user.role as UserRole);

  const handleChangeLang = (l: 'vi' | 'en') => {
    setLang(l);
    // Stub: chi luu state local. Sau nay noi backend / next-intl, doi o day.
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lang', l);
      window.dispatchEvent(new Event('lang:change'));
    }
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <UserTrigger user={user} isOpen={isOpen} onToggle={toggle} />

      {isOpen && (
        <div
          role="menu"
          aria-label="Tài khoản"
          className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-lg"
        >
          {/* Header: avatar + ten + email + role badge */}
          <MenuHeader user={user} />

          <Divider />

          {/* Link toi trang ho so (chua co trang - placeholder) */}
          <MenuItem href="/tai-khoan" onClick={close} icon={FiUserCheck}>
            Thông tin tài khoản
          </MenuItem>

          {/* Danh sach yeu cau booking da tao tu popup chi tiet quy can */}
          <MenuItem href="/don-hang-cua-toi" onClick={close} icon={FiShoppingCart}>
            Đơn hàng của tôi
          </MenuItem>

          {canAdmin && (
            <MenuItem href={ADMIN_URL} onClick={close} icon={FiUser} badge="Admin">
              Trang quản trị
            </MenuItem>
          )}

          <Divider />

          <LangSwitcher current={lang} onChange={handleChangeLang} />

          <MenuItem href="/cai-dat" onClick={close} icon={FiSettings}>
            Cài đặt
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => { close(); logout(); }} icon={FiLogOut} danger>
            Đăng xuất
          </MenuItem>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
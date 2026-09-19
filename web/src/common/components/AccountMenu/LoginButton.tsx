'use client';

import Link from 'next/link';

import { FiUser } from 'react-icons/fi';

const LoginButton = () => (
  <Link
    href="/login"
    aria-label="Đăng nhập"
    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 xl:w-auto xl:gap-1.5 xl:px-3 xl:text-theme-sm xl:font-semibold"
  >
    <FiUser aria-hidden />
    <span className="hidden xl:inline">Đăng nhập</span>
  </Link>
);

export default LoginButton;
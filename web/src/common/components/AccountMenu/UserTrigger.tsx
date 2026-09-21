'use client';

import Link from 'next/link';

import { FiChevronDown } from 'react-icons/fi';

import type { CurrentUser } from '@/common/auth/userStore';
import UserAvatar from '../UserAvatar';

export type UserTriggerProps = {
  user: CurrentUser;
  isOpen: boolean;
  onToggle: () => void;
};

const UserTrigger = ({ user, isOpen, onToggle }: UserTriggerProps) => (
  <>
    {/*
      Mobile + iPad: mot nut 36px, khong chevron.

      Dia avatar phai nho hon o dien thoai (28px): cac icon ben canh chi la net
      ve 20px, de avatar 36px kin mau thi no lan at ca hang. Tu iPad tro len
      header rong hon nen 36px van can doi.
    */}
    <button
      type="button"
      onClick={onToggle}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label="Mở menu tài khoản"
      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full xl:hidden"
    >
      {/* Nhich len 2px: cac icon ben canh deo huy hieu dem o goc tren nen tam
          nhin cua ca hang hoi cao hon tam hinh hoc - dia avatar can giua dung
          theo toan hoc lai thanh ra thap hon. Dich bang transform de khong
          lam xe dich o bam. */}
      <span className="-translate-y-0.5 md:hidden md:translate-y-0">
        <UserAvatar name={user.name} src={user.avatar} size={28} />
      </span>
      {/* Nhich len 2px, cung ly do nhu ban mobile o tren */}
      <span className="hidden md:block md:-translate-y-0.5">
        <UserAvatar name={user.name} src={user.avatar} size={36} />
      </span>
    </button>

    <Link
      href="/tai-khoan"
      aria-label="Mở trang tài khoản"
      className="hidden rounded-full p-0.5 transition hover:bg-brand-50 xl:block"
    >
      <UserAvatar name={user.name} src={user.avatar} size={40} />
    </Link>
    <button
      type="button"
      onClick={onToggle}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label="Mở menu tài khoản"
      className="hidden h-9 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-brand-50 hover:text-brand-700 xl:flex"
    >
      <FiChevronDown
        aria-hidden
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  </>
);

export default UserTrigger;
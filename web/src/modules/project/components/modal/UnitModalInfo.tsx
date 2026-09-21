import React, { useRef, useState } from 'react';
import {
  FiDollarSign,
  FiMaximize2,
  FiGift,
  FiFileText,
  FiShield,
  FiSend,
  FiMessageSquare,
  FiZap,
  FiCompass,
  FiHome,
  FiSearch,
  FiCreditCard
} from 'react-icons/fi';

/**
 * Cac cau hoi hay gap. Bam mot the la cau do duoc dien san vao o nhan tin de
 * nguoi dung sua tiep hoac gui luon - nhanh hon go lai tu dau.
 */
const QUICK_SUGGESTIONS = [
  { icon: FiDollarSign, text: 'Chính sách bán hàng hiện tại' },
  { icon: FiZap, text: 'Giá/m² và giá sau chiết khấu' },
  { icon: FiShield, text: 'Pháp lý dự án' },
];

export default function PropertyDetailCard() {
  const [chatMessage, setChatMessage] = useState('');
  const chatInputRef = useRef<HTMLInputElement>(null);

  /**
   * Dien cau hoi vao o nhan tin roi dua con tro ve cuoi dong: nguoi dung thay
   * ngay minh sap gui gi va co the them y rieng truoc khi bam gui.
   */
  const handleSuggestion = (text: string) => {
    setChatMessage(text);
    const input = chatInputRef.current;
    if (!input) return;
    input.focus();
    // Doi React ve xong gia tri moi roi moi dat con tro, neu khong no nhay
    // ve dau dong.
    requestAnimationFrame(() =>
      input.setSelectionRange(text.length, text.length),
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    console.log("Gửi tin nhắn:", chatMessage);
    setChatMessage('');
  };

  return (
    <div className="mx-auto bg-white rounded-2xl font-sans text-slate-800 space-y-3">
      {/* 1. GIÁ */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-900">Giá</span>
          </div>
          <button className="flex items-center gap-1 text-sm text-blue-600 font-medium bg-blue-50/60 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-100 transition-colors">
            Chi tiết
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 rounded-lg bg-slate-50/80 p-2.5 text-sm max-md:grid-cols-1 max-md:gap-2 md:max-lg:gap-x-1 md:max-lg:p-2 md:max-lg:text-xs">
          <div className="flex items-center justify-between gap-2 border-r border-slate-200 pr-2 max-md:border-r-0 max-md:pr-0 md:max-lg:gap-1 md:max-lg:pr-1.5">
            <span className="shrink-0 text-slate-600">Giá vay</span>
            <span className="whitespace-nowrap text-right font-semibold text-slate-800">Đang cập nhật</span>
          </div>
          <div className="flex items-center justify-between gap-2 pl-1 max-md:pl-0 md:max-lg:gap-1 md:max-lg:pl-0.5">
            <span className="shrink-0 text-slate-600">Giá TTTĐ</span>
            <span className="whitespace-nowrap text-right font-bold text-slate-900">2.97 tỷ</span>
          </div>
          <div className="flex items-center justify-between gap-2 border-r border-slate-200 pr-2 max-md:border-r-0 max-md:pr-0 md:max-lg:gap-1 md:max-lg:pr-1.5">
            <span className="shrink-0 text-slate-600">Giá TTS</span>
            <span className="whitespace-nowrap text-right font-semibold text-slate-800">Đang cập nhật</span>
          </div>
          <div className="flex items-center justify-between gap-2 pl-1 max-md:pl-0 md:max-lg:gap-1 md:max-lg:pl-0.5">
            <span className="shrink-0 text-slate-600">Đơn giá</span>
            <span className="whitespace-nowrap text-right font-bold text-slate-900">54.92 triệu/m²</span>
          </div>
        </div>
      </div>

      {/* 2. DIỆN TÍCH */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FiMaximize2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-900">Diện tích</span>
          </div>
          <button className="flex items-center gap-1 text-sm text-blue-600 font-medium bg-blue-50/60 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-100 transition-colors">
            Chi tiết
          </button>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-lg grid grid-cols-2 text-sm divide-x divide-slate-200">
          <div className="pr-2">
            <p className="text-slate-600 mb-0.5">DT đất</p>
            <p className="font-bold text-base text-slate-900">237.7 m²</p>
          </div>
          <div className="pl-3">
            <p className="text-slate-600 mb-0.5">DT xây dựng</p>
            <p className="font-bold text-base text-slate-900">377.3 m²</p>
          </div>
        </div>
      </div>

      {/* 3. CSBH & QUÀ TẶNG */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FiGift className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-900">CSBH & Quà tặng</span>
          </div>
          <button className="flex items-center gap-1 text-sm text-blue-600 font-medium bg-blue-50/60 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-100 transition-colors">
            Chi tiết
          </button>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-lg grid grid-cols-2 text-sm divide-x divide-slate-200">
          <div className="pr-2">
            <p className="text-slate-600 mb-0.5">CSBH áp dụng</p>
            <p className="font-bold text-sm text-slate-900">13/08/2026</p>
          </div>
          <div className="pl-3">
            <p className="text-slate-600 mb-0.5">Ưu đãi đặc biệt</p>
            <p className="font-bold text-sm text-slate-900">3 chỉ vàng - 45tr</p>
          </div>
        </div>
      </div>

      {/* 4. THÔNG TIN BÀN GIAO */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <FiFileText className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-slate-900">Thông tin bàn giao</span>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-lg space-y-1.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Tiêu chuẩn bàn giao</span>
            <span className="font-medium text-slate-900">Giản xây</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Quy cách:</span>
            <span className="font-medium text-slate-900">Thứ cấp</span>
          </div>
        </div>
      </div>

      {/* 5. PHÁP LÝ */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <FiShield className="w-5 h-5" />
          </div>
          <span className="font-bold text-base text-slate-900">Pháp lý</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50/60 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 text-sm font-semibold">
          <FiShield className="w-3.5 h-3.5 text-blue-600" />
          Sở hữu lâu dài
        </div>
      </div>

      {/* 6. CHAT INPUT & QUICK SUGGESTIONS */}
      <div className="pt-1 space-y-2">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <div className="absolute left-3 text-blue-500">
            <FiMessageSquare className="w-4 h-4" />
          </div>
          <input
            ref={chatInputRef}
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Nhắn tin với Admin..."
            className="w-full bg-white border border-slate-200 rounded-full py-4 pl-9 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
          <button
            type="submit"
            className="absolute right-1 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-xs"
          >
            <FiSend className="w-5 h-5" />
          </button>

        </form>

        {/* Thanh gợi ý nhanh phía dưới */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {QUICK_SUGGESTIONS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              type="button"
              onClick={() => handleSuggestion(text)}
              className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 px-3 py-1.5 rounded-full shrink-0 shadow-2xs text-slate-700 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-blue-500" />
              {text}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
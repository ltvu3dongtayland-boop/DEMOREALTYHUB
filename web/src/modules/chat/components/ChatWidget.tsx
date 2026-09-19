'use client';

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import { TbRobot } from 'react-icons/tb';
import { useChat } from '../hooks/useChat';
import {
  BOT_NAME,
  BOT_STATUS,
  CHATBOT_IMAGE,
  type ChatMessage,
} from '../models/chat.model';

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh',
});


const RobotImage = () => {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return <TbRobot aria-hidden className="h-3/5 w-3/5 text-white" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={CHATBOT_IMAGE}
      alt=""
      aria-hidden
      onError={() => setHasFailed(true)}
      className="h-full w-auto max-w-none"
    />
  );
};

/** Ba cham nhay so le - dau hieu bot dang soan cau tra loi */
const TypingBubble = () => (
  <div className="flex items-end gap-2">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-700">
      <RobotImage />
    </span>
    <span className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-3 shadow-card">
      <span className="sr-only">Trợ lý đang soạn tin nhắn</span>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden
          className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-gray-400"
          style={{ animationDelay: `${dot * 0.18}s` }}
        />
      ))}
    </span>
  </div>
);

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isBot = message.role === 'bot';
  const time = timeFormatter.format(new Date(message.sentAt));

  return (
    <div
      className={`animate-message-in flex items-end gap-2 ${
        isBot ? '' : 'flex-row-reverse'
      }`}
    >
      {isBot && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-700">
          <RobotImage />
        </span>
      )}

      <div className={`max-w-[78%] ${isBot ? '' : 'text-right'}`}>
        <p
          className={`whitespace-pre-line rounded-2xl px-4 py-2.5 text-theme-sm leading-relaxed ${
            isBot
              ? 'rounded-bl-sm border border-gray-200 bg-white text-gray-700 shadow-card'
              : 'brand-gradient rounded-br-sm text-left text-white shadow-card'
          }`}
        >
          {message.text}
        </p>
        <time
          dateTime={message.sentAt}
          className="mt-1 block px-1 text-[11px] text-gray-400"
        >
          {time}
        </time>
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const { messages, quickReplies, isTyping, isLoading, send } = useChat(isOpen);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Luon dinh day khi co tin moi hoac khi bot bat dau go
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isTyping) return;
    void send(draft);
    setDraft('');
  };

  const pickQuickReply = (label: string) => {
    if (isTyping) return;
    void send(label);
  };

  // Goi y chi co ich luc chua biet hoi gi - nguoi dung nhan roi thi an di
  const showQuickReplies =
    !isLoading && quickReplies.length > 0 && !messages.some((m) => m.role === 'user');

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Mở ${BOT_NAME}`}
          data-clean-hide="floating-widget"
          className="group brand-gradient fixed bottom-[232px] right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_24px_-6px_rgba(15,111,209,0.8)] transition-transform duration-300 ease-out hover:scale-110 active:scale-95 lg:bottom-44"
        >
          {/* Vong sang lan toa - nam duoi anh nen dung -z-10 */}
          <span
            aria-hidden
            className="brand-gradient animate-chat-halo absolute inset-0 -z-10 rounded-full"
          />

          {/* Khung tron cat bot phan anh tran ra hai ben. Anh robot dung yen -
              chuyen dong chi nam o vong sang va huy hieu. */}
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full">
            <RobotImage />
          </span>

          <span
            aria-hidden
            className="animate-chat-blink absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-error-500 text-[10px] font-bold text-white"
          >
            1
          </span>
        </button>
      )}

      {isOpen && (
        <>
          {/* Duoi sm khung chat chiem gan tron man hinh nen can lop nen mo phia sau */}
          <div
            aria-hidden
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-gray-900/40 sm:hidden"
          />

          <section
            role="dialog"
            aria-modal="false"
            aria-label={BOT_NAME}
            className="animate-chat-in fixed inset-x-4 bottom-4 z-50 flex h-[72dvh] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-[0_24px_60px_-12px_rgba(16,24,40,0.35)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-140 sm:max-h-[calc(100dvh-6rem)] sm:w-96"
          >
            {/* ── Dau khung ─────────────────────────────────────────────── */}
            <header className="brand-gradient flex shrink-0 items-center gap-3 px-4 py-3.5">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/15 backdrop-blur-md">
                <RobotImage />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-white">{BOT_NAME}</span>
                <span className="flex items-center gap-1.5 text-theme-xs text-white/80">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-success-500 shadow-[0_0_0_3px_rgba(18,183,106,0.3)]"
                  />
                  {BOT_STATUS}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng khung chat"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-white/25 active:scale-90"
              >
                <FiX aria-hidden />
              </button>
            </header>

            {/* ── Danh sach tin nhan ────────────────────────────────────── */}
            <div
              ref={scrollRef}
              aria-live="polite"
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            >
              {isLoading ? (
                <div className="space-y-4">
                  {[0, 1].map((row) => (
                    <div key={row} className="flex items-end gap-2">
                      <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-200" />
                      <span className="h-14 flex-1 animate-pulse rounded-2xl rounded-bl-sm bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.publicId} message={message} />
                ))
              )}

              {isTyping && <TypingBubble />}
            </div>

            {/* ── Goi y bam nhanh ───────────────────────────────────────── */}
            {showQuickReplies && (
              <div className="shrink-0 px-4 pb-3">
                <p className="mb-2 text-theme-xs font-medium text-gray-500">
                  Gợi ý câu hỏi
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply.publicId}
                      type="button"
                      onClick={() => pickQuickReply(reply.label)}
                      className="rounded-full border border-brand-200 bg-brand-25 px-3 py-1.5 text-theme-xs font-medium text-brand-600 transition hover:border-brand-400 hover:bg-brand-50 active:scale-95"
                    >
                      {reply.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── O soan tin ────────────────────────────────────────────── */}
            <form
              onSubmit={submit}
              className="flex shrink-0 items-center gap-2 border-t border-gray-200 bg-white p-3"
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                aria-label="Nội dung tin nhắn"
                className="h-11 min-w-0 flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 text-theme-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:shadow-focus-ring"
              />

              <button
                type="submit"
                disabled={!draft.trim() || isTyping}
                aria-label="Gửi tin nhắn"
                className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-card transition duration-200 hover:scale-110 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <FiSend aria-hidden />
              </button>
            </form>
          </section>
        </>
      )}
    </>
  );
};

export default ChatWidget;

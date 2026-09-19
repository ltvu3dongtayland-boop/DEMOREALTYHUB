/** Icon hop thu mo — hien khi thong bao da doc. Dung chung cho popover
 * chuong tren header va trang /thong-bao. */
const OpenMailboxIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={className}
  >
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
    <path d="M3 7 12 2l9 5-9 5-9-5Z" />
  </svg>
);

export default OpenMailboxIcon;

/**
 * Country flag as an image (flagcdn.com). Emoji flags don't render on Windows,
 * so we use real flag images instead. Falls back to a globe for unknown codes.
 */
export default function Flag({
  code,
  className = "",
}: {
  code: string | null | undefined;
  className?: string;
}) {
  const valid = code && /^[A-Za-z]{2}$/.test(code) && code !== "??";
  if (!valid) {
    return <span className={`inline-block align-middle ${className}`}>🌐</span>;
  }
  const cc = code!.toLowerCase();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${cc}.svg`}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      className={`inline-block h-[0.95em] w-auto rounded-[2px] align-middle ring-1 ring-black/5 ${className}`}
    />
  );
}

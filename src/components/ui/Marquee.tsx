export default function Marquee({
  children,
  duration = 40,
  reverse = false,
  className = "",
}: {
  children: React.ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`marquee ${reverse ? "marquee--rev" : ""} ${className}`}
      style={{ ["--marquee-dur" as string]: `${duration}s` }}
      aria-hidden
    >
      <div className="marquee__track">{children}</div>
      <div className="marquee__track">{children}</div>
    </div>
  );
}

export default function Logomark({ size = 34, className = "" }) {
  return (
    <img
      src="/images/admin/logo.png"
      alt="SUBASH STUDIO Logo"
      className={`object-contain rounded-lg ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
}
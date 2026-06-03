export const BrandLogo = ({ name = "GLOW", size = 48, dark = false, src }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const base = "rounded-2xl flex items-center justify-center font-display font-black tracking-tight flex-shrink-0 overflow-hidden";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={`${base} object-cover bg-white ring-1 ring-[#E5E5E5]`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`${base} ${dark ? "bg-white text-[#0A0A0A]" : "bg-[#0A0A0A] text-white"}`}
    >
      <span style={{ fontSize: size * 0.32 }}>{initials}</span>
    </div>
  );
};

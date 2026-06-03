export const BrandLogo = ({ name = "GLOW", size = 48, dark = false }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-2xl flex items-center justify-center font-display font-black tracking-tight flex-shrink-0 ${dark ? "bg-white text-[#0A0A0A]" : "bg-[#0A0A0A] text-white"}`}
    >
      <span style={{ fontSize: size * 0.32 }}>{initials}</span>
    </div>
  );
};

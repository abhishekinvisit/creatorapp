import { BrandLogo } from "@/components/BrandLogo";

/**
 * Logo + brand name shown vertically.
 * Used in the "Worked With" row on the creator profile.
 */
export const WorkedWithItem = ({ brand, size = 44, dark = false, children }) => {
  const nameCls = dark ? "text-neutral-300" : "text-[#525252]";
  return (
    <div className="relative flex-shrink-0 flex flex-col items-center gap-1.5 w-[68px]">
      <BrandLogo name={brand.name} size={size} dark={dark} src={brand.customLogo} />
      <span
        className={`text-[10px] font-bold leading-tight ${nameCls} text-center w-full break-words line-clamp-2`}
        title={brand.name}
      >
        {brand.name}
      </span>
      {children}
    </div>
  );
};

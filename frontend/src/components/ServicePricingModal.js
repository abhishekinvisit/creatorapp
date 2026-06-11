import { useState, useEffect } from "react";
import { X, Save, DollarSign, Plus, Trash2, IndianRupee, ToggleLeft, ToggleRight } from "lucide-react";
import { pricingApi } from "@/lib/api";
import { toast } from "sonner";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];

const STANDARD_SERVICES = [
  { key: "ig_reel",           label: "Instagram Reel",        emoji: "🎬" },
  { key: "ig_post",           label: "Instagram Post",        emoji: "📸" },
  { key: "ig_story",          label: "Instagram Story",       emoji: "📖" },
  { key: "reel_story_package",label: "Reel + Story Package",  emoji: "📦" },
  { key: "ugc_video",         label: "UGC Video",             emoji: "🎥" },
  { key: "event_appearance",  label: "Event Appearance",      emoji: "🎤" },
];

const EMPTY = {
  currency: "INR",
  negotiable: false,
  ig_reel: "",
  ig_post: "",
  ig_story: "",
  reel_story_package: "",
  ugc_video: "",
  event_appearance: "",
  custom_services: [],
};

function formatPrice(val, currency) {
  if (!val && val !== 0) return null;
  const sym = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency;
  return `${sym}${Number(val).toLocaleString("en-IN")}`;
}

function PriceInput({ label, emoji, value, onChange, currency }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0F0F0] last:border-0">
      <span className="text-lg w-7 text-center flex-shrink-0">{emoji}</span>
      <span className="flex-1 text-sm font-medium text-[#0A0A0A]">{label}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-bold text-[#525252]">
          {currency === "INR" ? "₹" : currency}
        </span>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="w-24 px-3 py-1.5 rounded-xl bg-[#F3F3F3] border border-[#E5E5E5] text-sm font-bold text-right outline-none focus:border-[#0A0A0A] placeholder-[#BDBDBD]"
        />
      </div>
    </div>
  );
}

export function ServicePricingModal({ open, onClose, isOwner = false, initialData = null }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomPrice, setNewCustomPrice] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialData && Object.keys(initialData).length > 0) {
      loadFromData(initialData);
    } else if (isOwner) {
      setLoading(true);
      pricingApi.get()
        .then((data) => {
          if (data && Object.keys(data).length > 0) loadFromData(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (initialData) {
      loadFromData(initialData);
    }
  }, [open, isOwner]); // eslint-disable-line

  function loadFromData(data) {
    setForm({
      currency: data.currency || "INR",
      negotiable: !!data.negotiable,
      ig_reel: data.ig_reel ?? "",
      ig_post: data.ig_post ?? "",
      ig_story: data.ig_story ?? "",
      reel_story_package: data.reel_story_package ?? "",
      ugc_video: data.ugc_video ?? "",
      event_appearance: data.event_appearance ?? "",
      custom_services: Array.isArray(data.custom_services) ? data.custom_services : [],
    });
  }

  const setF = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addCustom = () => {
    const name = newCustomName.trim();
    if (!name) { toast.error("Enter a service name"); return; }
    setF("custom_services", [
      ...form.custom_services,
      { name, price: newCustomPrice ? parseInt(newCustomPrice) || null : null },
    ]);
    setNewCustomName("");
    setNewCustomPrice("");
  };

  const removeCustom = (i) =>
    setF("custom_services", form.custom_services.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await pricingApi.save({
        currency: form.currency,
        negotiable: form.negotiable,
        ig_reel: form.ig_reel !== "" ? parseInt(form.ig_reel) || null : null,
        ig_post: form.ig_post !== "" ? parseInt(form.ig_post) || null : null,
        ig_story: form.ig_story !== "" ? parseInt(form.ig_story) || null : null,
        reel_story_package: form.reel_story_package !== "" ? parseInt(form.reel_story_package) || null : null,
        ugc_video: form.ugc_video !== "" ? parseInt(form.ugc_video) || null : null,
        event_appearance: form.event_appearance !== "" ? parseInt(form.event_appearance) || null : null,
        custom_services: form.custom_services,
      });
      toast.success("Pricing saved!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const hasAnyPrice = STANDARD_SERVICES.some((s) => form[s.key] !== "" && form[s.key] !== null)
    || form.custom_services.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee size={18} className="text-[#E25238]" />
              <h2 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight">Service Pricing</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center">
              <X size={18} />
            </button>
          </div>
          {isOwner && (
            <p className="text-xs text-[#525252] font-medium mt-1.5">
              Set your rates so brands know what to expect.
            </p>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-[#E25238] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">

            {/* Currency + Negotiable */}
            {isOwner && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#525252] mb-1.5">Currency</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setF("currency", c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          form.currency === c
                            ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                            : "bg-white text-[#525252] border-[#E5E5E5] hover:border-[#0A0A0A]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Negotiable toggle */}
            {isOwner ? (
              <button
                onClick={() => setF("negotiable", !form.negotiable)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#F9F9F8] border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-[#0A0A0A]">Negotiable Pricing</p>
                  <p className="text-xs text-[#525252] font-medium">Brands can suggest their own budget</p>
                </div>
                {form.negotiable
                  ? <ToggleRight size={28} className="text-[#E25238] flex-shrink-0" />
                  : <ToggleLeft size={28} className="text-[#BDBDBD] flex-shrink-0" />
                }
              </button>
            ) : form.negotiable ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#E25238]/8 border border-[#E25238]/20">
                <span className="text-sm font-bold text-[#E25238]">✓ Open to negotiation</span>
              </div>
            ) : null}

            {/* Standard services */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#525252] mb-2">Standard Services</p>
              <div className="bg-[#F9F9F8] border border-[#E5E5E5] rounded-2xl px-4 py-1">
                {STANDARD_SERVICES.map((s) =>
                  isOwner ? (
                    <PriceInput
                      key={s.key}
                      label={s.label}
                      emoji={s.emoji}
                      value={form[s.key]}
                      onChange={(v) => setF(s.key, v)}
                      currency={form.currency}
                    />
                  ) : (form[s.key] !== null && form[s.key] !== undefined && form[s.key] !== "") ? (
                    <div key={s.key} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0] last:border-0">
                      <span className="text-lg w-7 text-center flex-shrink-0">{s.emoji}</span>
                      <span className="flex-1 text-sm font-medium text-[#0A0A0A]">{s.label}</span>
                      <span className="text-sm font-black text-[#0A0A0A]">
                        {formatPrice(form[s.key], form.currency)}
                      </span>
                    </div>
                  ) : null
                )}
                {!isOwner && !hasAnyPrice && (
                  <p className="py-4 text-sm text-[#525252] font-medium text-center">No pricing set yet.</p>
                )}
              </div>
            </div>

            {/* Custom services */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#525252] mb-2">Custom Services</p>
              {form.custom_services.length > 0 && (
                <div className="bg-[#F9F9F8] border border-[#E5E5E5] rounded-2xl px-4 py-1 mb-3">
                  {form.custom_services.map((svc, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0] last:border-0">
                      <span className="text-lg w-7 text-center flex-shrink-0">🌟</span>
                      <span className="flex-1 text-sm font-medium text-[#0A0A0A]">{svc.name}</span>
                      <span className="text-sm font-black text-[#0A0A0A] mr-1">
                        {svc.price ? formatPrice(svc.price, form.currency) : "—"}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => removeCustom(i)}
                          className="w-7 h-7 rounded-full bg-[#FFE8E4] flex items-center justify-center hover:bg-[#E25238] hover:text-white transition-colors text-[#E25238]"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isOwner && (
                <div className="flex gap-2">
                  <input
                    value={newCustomName}
                    onChange={(e) => setNewCustomName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                    placeholder="Service name"
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[#F3F3F3] border border-[#E5E5E5] text-sm outline-none focus:border-[#0A0A0A]"
                  />
                  <input
                    type="number"
                    min="0"
                    value={newCustomPrice}
                    onChange={(e) => setNewCustomPrice(e.target.value)}
                    placeholder="Price"
                    className="w-24 px-3 py-2.5 rounded-xl bg-[#F3F3F3] border border-[#E5E5E5] text-sm text-right outline-none focus:border-[#0A0A0A]"
                  />
                  <button
                    onClick={addCustom}
                    className="w-10 h-10 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center hover:bg-[#E25238] transition-colors flex-shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Save */}
            {isOwner && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-full bg-[#E25238] text-white font-bold text-sm hover:bg-[#C9452D] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Pricing"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { X, Save, BarChart2, Users, MapPin, Plus, Upload } from "lucide-react";
import { audienceInsightsApi } from "@/lib/api";
import { toast } from "sonner";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const GENDER_COLORS = ["#E25238", "#F59E0B", "#525252"];

function formatPct(v) {
  const n = parseFloat(v) || 0;
  return n.toFixed(1);
}

function TagInput({ values, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setInput("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 px-2.5 py-1 bg-[#E25238]/10 text-[#E25238] rounded-full text-xs font-bold">
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} className="hover:opacity-70">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl bg-[#F3F3F3] border border-[#E5E5E5] text-sm outline-none focus:border-[#0A0A0A]"
        />
        <button
          onClick={add}
          className="px-3 py-2 rounded-xl bg-[#0A0A0A] text-white text-sm font-bold hover:bg-[#E25238] transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

const EMPTY = {
  gender_male: 0, gender_female: 0, gender_other: 0,
  age_13_17: 0, age_18_24: 0, age_25_34: 0, age_35_44: 0, age_45_plus: 0,
  top_countries: [], top_cities: [], top_states: [], source_platforms: [],
};

export function AudienceInsightsModal({ open, onClose, isOwner = false, initialData = null }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        gender_male: parseFloat(initialData.gender_male) || 0,
        gender_female: parseFloat(initialData.gender_female) || 0,
        gender_other: parseFloat(initialData.gender_other) || 0,
        age_13_17: parseFloat(initialData.age_13_17) || 0,
        age_18_24: parseFloat(initialData.age_18_24) || 0,
        age_25_34: parseFloat(initialData.age_25_34) || 0,
        age_35_44: parseFloat(initialData.age_35_44) || 0,
        age_45_plus: parseFloat(initialData.age_45_plus) || 0,
        top_countries: Array.isArray(initialData.top_countries) ? initialData.top_countries : [],
        top_cities: Array.isArray(initialData.top_cities) ? initialData.top_cities : [],
        top_states: Array.isArray(initialData.top_states) ? initialData.top_states : [],
        source_platforms: Array.isArray(initialData.source_platforms) ? initialData.source_platforms : [],
      });
    } else if (isOwner) {
      setLoading(true);
      audienceInsightsApi.get()
        .then((data) => {
          if (data && data.creator_id) {
            setForm({
              gender_male: parseFloat(data.gender_male) || 0,
              gender_female: parseFloat(data.gender_female) || 0,
              gender_other: parseFloat(data.gender_other) || 0,
              age_13_17: parseFloat(data.age_13_17) || 0,
              age_18_24: parseFloat(data.age_18_24) || 0,
              age_25_34: parseFloat(data.age_25_34) || 0,
              age_35_44: parseFloat(data.age_35_44) || 0,
              age_45_plus: parseFloat(data.age_45_plus) || 0,
              top_countries: Array.isArray(data.top_countries) ? data.top_countries : [],
              top_cities: Array.isArray(data.top_cities) ? data.top_cities : [],
              top_states: Array.isArray(data.top_states) ? data.top_states : [],
              source_platforms: Array.isArray(data.source_platforms) ? data.source_platforms : [],
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, isOwner, initialData]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setN = (key, val) => setForm((f) => ({ ...f, [key]: Math.min(100, Math.max(0, parseFloat(val) || 0)) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await audienceInsightsApi.save({
        gender_male: form.gender_male,
        gender_female: form.gender_female,
        gender_other: form.gender_other,
        age_13_17: form.age_13_17,
        age_18_24: form.age_18_24,
        age_25_34: form.age_25_34,
        age_35_44: form.age_35_44,
        age_45_plus: form.age_45_plus,
        top_countries: form.top_countries,
        top_cities: form.top_cities,
        top_states: form.top_states,
        source_platforms: form.source_platforms,
      });
      toast.success("Audience insights saved!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save insights");
    } finally {
      setSaving(false);
    }
  };

  const handleExtract = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Screenshot must be under 10 MB");
      return;
    }
    setExtracting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imageData = ev.target.result;
        const res = await audienceInsightsApi.extract(imageData);
        if (res?.data) {
          const d = res.data;
          setForm((f) => ({
            ...f,
            gender_male:  parseFloat(d.gender_male)  || f.gender_male,
            gender_female: parseFloat(d.gender_female) || f.gender_female,
            gender_other: parseFloat(d.gender_other) || f.gender_other,
            age_13_17:    parseFloat(d.age_13_17)    || f.age_13_17,
            age_18_24:    parseFloat(d.age_18_24)    || f.age_18_24,
            age_25_34:    parseFloat(d.age_25_34)    || f.age_25_34,
            age_35_44:    parseFloat(d.age_35_44)    || f.age_35_44,
            age_45_plus:  parseFloat(d.age_45_plus)  || f.age_45_plus,
            top_cities:    d.top_cities?.length    ? d.top_cities    : f.top_cities,
            top_states:    d.top_states?.length    ? d.top_states    : f.top_states,
            top_countries: d.top_countries?.length ? d.top_countries : f.top_countries,
            source_platforms: d.source_platforms?.length ? d.source_platforms : f.source_platforms,
          }));
          toast.success("Data extracted! Review and save.");
        }
      } catch (err) {
        toast.error(err.message || "Extraction failed. Try entering data manually.");
      } finally {
        setExtracting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  const genderData = [
    { name: "Male", value: form.gender_male },
    { name: "Female", value: form.gender_female },
    { name: "Other", value: form.gender_other },
  ].filter((d) => d.value > 0);

  const ageData = [
    { name: "13-17", value: form.age_13_17 },
    { name: "18-24", value: form.age_18_24 },
    { name: "25-34", value: form.age_25_34 },
    { name: "35-44", value: form.age_35_44 },
    { name: "45+", value: form.age_45_plus },
  ];

  const hasData = form.gender_male > 0 || form.gender_female > 0 || form.age_18_24 > 0 || form.age_25_34 > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-[#E25238]" />
              <h2 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight">Audience Insights</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center">
              <X size={18} />
            </button>
          </div>
          {isOwner && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-[#525252] font-medium">
                Enter data manually or scan a screenshot from Instagram / YouTube Analytics.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={extracting}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0A0A0A] bg-white text-xs font-bold text-[#0A0A0A] hover:bg-[#F3F3F3] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <Upload size={12} />
                {extracting ? "Scanning…" : "Scan Screenshot"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleExtract}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-[#E25238] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-6">
            {/* Gender breakdown */}
            <Section title="Gender Breakdown" icon={<Users size={14} className="text-[#E25238]" />}>
              {isOwner ? (
                <div className="space-y-3">
                  {[
                    { key: "gender_male", label: "Male %" },
                    { key: "gender_female", label: "Female %" },
                    { key: "gender_other", label: "Other %" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#525252] w-20 flex-shrink-0">{label}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form[key]}
                        onChange={(e) => setN(key, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#F3F3F3] border border-[#E5E5E5] text-sm font-medium outline-none focus:border-[#0A0A0A]"
                      />
                      <div className="w-16 h-2 bg-[#F3F3F3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E25238] rounded-full transition-all"
                          style={{ width: `${Math.min(100, form[key])}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasData && genderData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={genderData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                        {genderData.map((_, i) => (
                          <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1.5">
                    {genderData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: GENDER_COLORS[i] }} />
                        <span className="text-sm font-medium text-[#525252]">{d.name}</span>
                        <span className="text-sm font-black text-[#0A0A0A] ml-auto">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#525252] font-medium">No gender data available.</p>
              )}
            </Section>

            {/* Age breakdown */}
            <Section title="Age Distribution" icon={<BarChart2 size={14} className="text-[#E25238]" />}>
              {isOwner ? (
                <div className="space-y-3">
                  {[
                    { key: "age_13_17", label: "13-17 %" },
                    { key: "age_18_24", label: "18-24 %" },
                    { key: "age_25_34", label: "25-34 %" },
                    { key: "age_35_44", label: "35-44 %" },
                    { key: "age_45_plus", label: "45+ %" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#525252] w-20 flex-shrink-0">{label}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form[key]}
                        onChange={(e) => setN(key, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#F3F3F3] border border-[#E5E5E5] text-sm font-medium outline-none focus:border-[#0A0A0A]"
                      />
                    </div>
                  ))}
                </div>
              ) : hasData ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={ageData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [`${v}%`, "Share"]} />
                    <Bar dataKey="value" fill="#E25238" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-[#525252] font-medium">No age data available.</p>
              )}
            </Section>

            {/* Top Locations */}
            <Section title="Top Locations" icon={<MapPin size={14} className="text-[#E25238]" />}>
              {isOwner ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#525252] mb-2">Top Cities</p>
                    <TagInput
                      values={form.top_cities}
                      onChange={(v) => set("top_cities", v)}
                      placeholder="Add city (press Enter)"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#525252] mb-2">Top States</p>
                    <TagInput
                      values={form.top_states}
                      onChange={(v) => set("top_states", v)}
                      placeholder="Add state (press Enter)"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#525252] mb-2">Top Countries</p>
                    <TagInput
                      values={form.top_countries}
                      onChange={(v) => set("top_countries", v)}
                      placeholder="Add country (press Enter)"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.top_cities.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#E25238] mb-1.5">Cities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.top_cities.map((c) => (
                          <span key={c} className="px-2.5 py-1 bg-[#F3F3F3] text-[#0A0A0A] text-xs font-bold rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.top_states.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#E25238] mb-1.5">States</p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.top_states.map((s) => (
                          <span key={s} className="px-2.5 py-1 bg-[#F3F3F3] text-[#0A0A0A] text-xs font-bold rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.top_countries.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#E25238] mb-1.5">Countries</p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.top_countries.map((c) => (
                          <span key={c} className="px-2.5 py-1 bg-[#F3F3F3] text-[#0A0A0A] text-xs font-bold rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.top_cities.length === 0 && form.top_states.length === 0 && form.top_countries.length === 0 && (
                    <p className="text-sm text-[#525252] font-medium">No location data available.</p>
                  )}
                </div>
              )}
            </Section>

            {/* Source platforms */}
            {isOwner && (
              <Section title="Data Sources" icon={<BarChart2 size={14} className="text-[#E25238]" />}>
                <p className="text-xs text-[#525252] mb-2 font-medium">Which platforms did this data come from?</p>
                <TagInput
                  values={form.source_platforms}
                  onChange={(v) => set("source_platforms", v)}
                  placeholder="e.g. Instagram, YouTube (press Enter)"
                />
              </Section>
            )}
            {!isOwner && form.source_platforms?.length > 0 && (
              <Section title="Data Sources" icon={<BarChart2 size={14} className="text-[#E25238]" />}>
                <div className="flex flex-wrap gap-1.5">
                  {form.source_platforms.map((p) => (
                    <span key={p} className="px-2.5 py-1 bg-[#0A0A0A] text-white text-xs font-bold rounded-full">{p}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Action buttons */}
            {isOwner && (
              <div className="space-y-3 pt-1">
                {extracting && (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#F3F3F3] text-sm text-[#525252] font-medium">
                    <div className="w-4 h-4 border-2 border-[#E5E5E5] border-t-[#E25238] rounded-full animate-spin" />
                    Reading screenshot with AI…
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || extracting}
                  className="w-full py-4 rounded-full bg-[#E25238] text-white font-bold text-sm hover:bg-[#C9452D] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Audience Insights"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#525252]">{title}</p>
      </div>
      {children}
    </div>
  );
}

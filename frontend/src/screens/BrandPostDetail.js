import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, Users, Wallet, Calendar, Tag, Filter, MapPin, Globe, Eye, Check, X } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { opportunitiesApi } from "@/lib/api";
import { toast } from "sonner";

import { MASTER_CATEGORIES as CATS } from "@/data/categories";
const AGES = ["Any Age", "13-17", "18-24", "25-34", "35+"];
const GENDERS = ["All", "Female", "Male", "Non-binary"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Malayalam", "Punjabi"];

export default function BrandPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activePosts, setActivePosts } = useApp();
  const [post, setPost] = useState(() => activePosts.find((p) => p.id === id) || null);
  const [loading, setLoading] = useState(!post);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  // Fetch from API if not in context
  useEffect(() => {
    if (post) {
      setForm(buildForm(post));
      return;
    }
    setLoading(true);
    opportunitiesApi.get(id)
      .then((p) => {
        const mapped = {
          id: p.id,
          title: p.title,
          description: p.description || p.pitch || "",
          pitch: p.pitch || p.description || "",
          payout: p.payout || 0,
          needed: p.creators_needed || 1,
          deadline: p.deadline || "",
          category: p.category || "",
          cover_url: p.cover_url || "",
          applicants: p.applicants_count || 0,
          status: p.status || "active",
          languages: p.languages || [],
          requirements: p.requirements || [],
        };
        setPost(mapped);
        setForm(buildForm(mapped));
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  // Sync form when post updates from context
  useEffect(() => {
    const ctx = activePosts.find((p) => p.id === id);
    if (ctx && !post) {
      setPost(ctx);
      setForm(buildForm(ctx));
    }
  }, [activePosts, id]); // eslint-disable-line

  if (loading) {
    return (
      <div className="min-h-full bg-[#0A0A0A] text-white flex items-center justify-center">
        <p className="text-neutral-400 font-medium">Loading…</p>
      </div>
    );
  }

  if (!post || !form) {
    return (
      <div className="min-h-full bg-[#0A0A0A] text-white flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display font-bold text-lg">Post not found</p>
        <button
          onClick={() => navigate("/brand/dashboard")}
          className="mt-4 px-5 py-3 bg-[#E25238] rounded-full text-sm font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error("Campaign title is required"); return; }
    setSaving(true);
    try {
      await opportunitiesApi.update(id, {
        title: form.title,
        pitch: form.description,
        description: form.description,
        payout: parseInt(form.payout) || 0,
        creators_needed: parseInt(form.needed) || 1,
        deadline: form.deadline,
        cover_url: form.cover_url || "",
        category: form.category || "",
        languages: form.languages || [],
        requirements: form.requirements || [],
      });
      const updated = {
        ...post, ...form,
        payout: parseInt(form.payout) || 0,
        needed: parseInt(form.needed) || 1,
        category: form.category || "",
        requirements: form.requirements || [],
      };
      setPost(updated);
      setActivePosts((prev) => prev.map((p) => p.id === id ? updated : p));
      setEditing(false);
      toast.success("Post updated");
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await opportunitiesApi.delete(id);
      setActivePosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
      navigate("/brand/dashboard");
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleCancel = () => {
    setForm(buildForm(post));
    setEditing(false);
  };

  return (
    <div data-testid="brand-post-detail" className="min-h-full bg-[#0A0A0A] text-white pb-10">
      <TopBar
        title={editing ? "Edit Post" : "Manage Post"}
        dark
        rightSlot={
          editing ? (
            <div className="flex items-center gap-2">
              <button
                data-testid="cancel-edit"
                onClick={handleCancel}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X size={18} />
              </button>
              <button
                data-testid="save-post"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#E25238] rounded-full text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 disabled:opacity-60"
              >
                <Check size={14} strokeWidth={2.8} /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <button
              data-testid="edit-post"
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-[#E25238] rounded-full text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1.5"
            >
              <Pencil size={12} /> Edit
            </button>
          )
        }
      />

      <div className="px-5">
        {/* Cover image */}
        {post.cover_url && !editing && (
          <div className="w-full h-40 rounded-2xl overflow-hidden mb-4">
            <img src={post.cover_url} alt="cover" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Status banner */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-xs font-bold uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            {post.status || "Active"}
          </div>
          <button
            data-testid="view-applicants"
            onClick={() => navigate("/brand/applicants", { state: { opportunityId: id } })}
            className="text-xs font-bold uppercase tracking-[0.15em] text-[#E25238] flex items-center gap-1.5"
          >
            <Eye size={14} /> {post.applicants} applicants
          </button>
        </div>

        {editing ? (
          <EditForm form={form} setForm={setForm} />
        ) : (
          <ViewBody post={post} />
        )}

        {!editing && (
          <button
            data-testid="delete-post"
            onClick={handleDelete}
            className="mt-8 w-full py-4 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-bold flex items-center justify-center gap-2 hover:bg-[#EF4444] hover:text-white transition-colors"
          >
            <Trash2 size={16} /> Delete Post
          </button>
        )}
      </div>
    </div>
  );
}

function buildForm(post) {
  return {
    title: post.title || "",
    description: post.description || post.pitch || "",
    payout: post.payout || "",
    needed: post.needed || "",
    deadline: post.deadline || "",
    cover_url: post.cover_url || "",
    category: post.category || "",
    languages: post.languages || [],
    requirements: post.requirements || [],
  };
}

const ViewBody = ({ post }) => (
  <>
    <h1 className="font-display font-black text-3xl tracking-tight leading-tight">{post.title}</h1>
    {post.description && (
      <p className="text-sm text-neutral-400 font-medium leading-relaxed mt-3">{post.description}</p>
    )}

    <div className="grid grid-cols-3 gap-3 mt-6">
      <Stat icon={Wallet} label="Payout" value={post.payout ? `₹${post.payout}` : "—"} />
      <Stat icon={Users} label="Needed" value={post.needed || "—"} />
      <Stat icon={Calendar} label="Deadline" value={post.deadline || "—"} />
    </div>

    <div className="mt-7">
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238] mb-3">Details</p>
      <div className="bg-white/5 border border-white/10 rounded-3xl divide-y divide-white/10">
        <Row icon={Tag} label="Category" value={post.category} />
        <LanguageRow langs={post.languages} />
      </div>
    </div>

    {post.requirements?.length > 0 && (
      <div className="mt-5">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238] mb-3">Requirements</p>
        <div className="bg-white/5 border border-white/10 rounded-3xl divide-y divide-white/10">
          {post.requirements.map((req, i) => (
            <div key={i} className="flex items-center px-5 py-4 gap-3">
              <Filter size={14} className="text-[#E25238] flex-shrink-0" />
              <span className="text-sm font-medium text-white">{req}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

const Stat = ({ icon: Icon, label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
    <Icon size={14} className="text-[#E25238] mb-1.5" />
    <p className="font-display font-black text-base leading-tight truncate">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">{label}</p>
  </div>
);

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-center px-5 py-4 gap-3">
    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
      <Icon size={14} className="text-[#E25238]" />
    </div>
    <span className="flex-1 text-sm font-medium text-neutral-400">{label}</span>
    <span className="text-sm font-bold text-white text-right">{value || "—"}</span>
  </div>
);

const LanguageRow = ({ langs }) => (
  <div className="flex items-start px-5 py-4 gap-3">
    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
      <Globe size={14} className="text-[#E25238]" />
    </div>
    <span className="text-sm font-medium text-neutral-400 pt-0.5 flex-shrink-0">Language</span>
    <div className="flex-1 flex flex-wrap gap-1.5 justify-end">
      {langs?.length
        ? langs.map((l) => (
            <span key={l} className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold">{l}</span>
          ))
        : <span className="text-sm font-bold text-white">—</span>}
    </div>
  </div>
);

const EditForm = ({ form, setForm }) => {
  const coverRef = useState(null)[0];
  const inputRef = { current: null };

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, cover_url: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Cover image upload */}
      <Field label="Cover Image">
        <div
          className="w-full h-36 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-[#E25238] transition-colors relative"
          onClick={() => document.getElementById("cover-file-input")?.click()}
        >
          {form.cover_url ? (
            <img src={form.cover_url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-400">
              <Wallet size={24} />
              <span className="text-xs font-bold">Tap to upload cover image</span>
            </div>
          )}
          <input
            id="cover-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFile}
          />
        </div>
      </Field>

      <Field label="Campaign Title">
        <input
          data-testid="edit-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
        />
      </Field>
      <Field label="Campaign Description">
        <textarea
          data-testid="edit-desc"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium resize-none focus:border-[#E25238]"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Payout (₹)">
          <input
            data-testid="edit-payout"
            type="number"
            value={form.payout}
            onChange={(e) => setForm({ ...form, payout: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
          />
        </Field>
        <Field label="Creators Needed">
          <input
            data-testid="edit-needed"
            type="number"
            value={form.needed}
            onChange={(e) => setForm({ ...form, needed: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
          />
        </Field>
      </div>
      <Field label="Deadline">
        <input
          data-testid="edit-deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
        />
      </Field>

      <Field label="Category">
        <CategoryPicker form={form} setForm={setForm} />
      </Field>

      <Field label="Requirements">
        <div className="space-y-2">
          {(form.requirements || []).map((req, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={req}
                onChange={(e) => {
                  const next = [...form.requirements];
                  next[i] = e.target.value;
                  setForm({ ...form, requirements: next });
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none text-white text-sm font-medium focus:border-[#E25238]"
                placeholder="e.g. Min 10K followers"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, requirements: form.requirements.filter((_, j) => j !== i) })}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-[#EF4444] flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm({ ...form, requirements: [...(form.requirements || []), ""] })}
            className="text-xs font-bold text-[#E25238] uppercase tracking-[0.15em] px-1"
          >
            + Add Requirement
          </button>
        </div>
      </Field>

      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238] pt-2">Content Language</p>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((l) => {
          const active = (form.languages || []).includes(l);
          return (
            <button
              key={l}
              type="button"
              onClick={() => {
                const cur = form.languages || [];
                setForm({ ...form, languages: active ? cur.filter((x) => x !== l) : [...cur, l] });
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                active ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">{label}</p>
    {children}
  </div>
);

const CategoryPicker = ({ form, setForm }) => {
  const [q, setQ] = React.useState("");
  const filtered = CATS.filter((c) => c.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search categories…"
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none text-white placeholder-neutral-500 text-sm font-medium focus:border-[#E25238] mb-3"
      />
      <div className="flex flex-wrap gap-2">
        {filtered.map((cat) => {
          const active = form.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setForm({ ...form, category: active ? "" : cat })}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                active ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, Users, Wallet, Calendar, Tag, Filter, MapPin, Eye, Check, X } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

const CATS = ["Beauty", "Fashion", "Lifestyle", "Fitness", "Food", "Tech"];
const AGES = ["Any Age", "13-17", "18-24", "25-34", "35+"];
const GENDERS = ["All", "Female", "Male", "Non-binary"];

export default function BrandPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activePosts, updatePost, deletePost } = useApp();
  const post = activePosts.find((p) => p.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => post ? { ...post, requirements: { ...post.requirements } } : null);

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

  const handleSave = () => {
    if (!form.title?.trim()) {
      toast.error("Campaign title is required");
      return;
    }
    updatePost(post.id, {
      title: form.title,
      description: form.description,
      payout: form.payout,
      needed: parseInt(form.needed) || 0,
      deadline: form.deadline,
      requirements: form.requirements,
    });
    setEditing(false);
    toast.success("Post updated");
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this post permanently?")) return;
    deletePost(post.id);
    toast.success("Post deleted");
    navigate("/brand/dashboard");
  };

  const handleCancel = () => {
    setForm({ ...post, requirements: { ...post.requirements } });
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
                aria-label="Cancel edit"
              >
                <X size={18} />
              </button>
              <button
                data-testid="save-post"
                onClick={handleSave}
                className="px-4 py-2 bg-[#E25238] rounded-full text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1.5"
              >
                <Check size={14} strokeWidth={2.8} /> Save
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
        {/* Status banner */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-xs font-bold uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            {post.status || "Active"}
          </div>
          <button
            data-testid="view-applicants"
            onClick={() => navigate("/brand/applicants")}
            className="text-xs font-bold uppercase tracking-[0.15em] text-[#E25238] flex items-center gap-1.5"
          >
            <Eye size={14} /> {post.applicants} applicants
          </button>
        </div>

        {/* Body */}
        {editing ? (
          <EditForm form={form} setForm={setForm} />
        ) : (
          <ViewBody post={post} />
        )}

        {/* Danger zone */}
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

const ViewBody = ({ post }) => (
  <>
    <h1 className="font-display font-black text-3xl tracking-tight leading-tight">{post.title}</h1>
    {post.description && (
      <p className="text-sm text-neutral-400 font-medium leading-relaxed mt-3">{post.description}</p>
    )}

    {/* Stats */}
    <div className="grid grid-cols-3 gap-3 mt-6">
      <Stat icon={Wallet} label="Payout" value={post.payout ? `₹${post.payout}` : "—"} />
      <Stat icon={Users} label="Needed" value={post.needed} />
      <Stat icon={Calendar} label="Deadline" value={post.deadline || "—"} />
    </div>

    {/* Requirements */}
    <div className="mt-7">
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238] mb-3">Requirements</p>
      <div className="bg-white/5 border border-white/10 rounded-3xl divide-y divide-white/10">
        <Row icon={Tag} label="Category" value={post.requirements?.category} />
        <Row icon={Users} label="Min Followers" value={post.requirements?.minFollowers} />
        <Row icon={Filter} label="Age Group" value={post.requirements?.age} />
        <Row icon={Filter} label="Gender" value={post.requirements?.gender} />
        <Row icon={MapPin} label="Location" value={post.requirements?.location} />
      </div>
    </div>
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

const EditForm = ({ form, setForm }) => {
  const setReq = (k, v) => setForm({ ...form, requirements: { ...form.requirements, [k]: v } });
  return (
    <div className="space-y-5">
      <Field label="Campaign Title">
        <input
          data-testid="edit-title"
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
        />
      </Field>
      <Field label="Campaign Description">
        <textarea
          data-testid="edit-desc"
          rows={3}
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium resize-none focus:border-[#E25238]"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Payout (₹)">
          <input
            data-testid="edit-payout"
            type="number"
            value={form.payout || ""}
            onChange={(e) => setForm({ ...form, payout: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
          />
        </Field>
        <Field label="Creators Needed">
          <input
            data-testid="edit-needed"
            type="number"
            value={form.needed || ""}
            onChange={(e) => setForm({ ...form, needed: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
          />
        </Field>
      </div>
      <Field label="Deadline">
        <input
          data-testid="edit-deadline"
          type="date"
          value={form.deadline || ""}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
        />
      </Field>

      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238] pt-2">Requirements</p>

      <Field label="Category">
        <Pills options={CATS} value={form.requirements?.category} onChange={(v) => setReq("category", v)} testId="edit-cat" />
      </Field>
      <Field label="Min Followers">
        <input
          data-testid="edit-min-followers"
          type="number"
          value={form.requirements?.minFollowers || ""}
          onChange={(e) => setReq("minFollowers", e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
        />
      </Field>
      <Field label="Age Group">
        <Pills options={AGES} value={form.requirements?.age} onChange={(v) => setReq("age", v)} testId="edit-age" />
      </Field>
      <Field label="Gender">
        <Pills options={GENDERS} value={form.requirements?.gender} onChange={(v) => setReq("gender", v)} testId="edit-gender" />
      </Field>
      <Field label="Location">
        <input
          data-testid="edit-location"
          value={form.requirements?.location || ""}
          onChange={(e) => setReq("location", e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white font-medium focus:border-[#E25238]"
        />
      </Field>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">{label}</p>
    {children}
  </div>
);

const Pills = ({ options, value, onChange, testId }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o}
        data-testid={`${testId}-${o.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={() => onChange(o)}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
          value === o ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

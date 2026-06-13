import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { useNavigate } from "react-router-dom";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY_BLOG = {
  title: "", slug: "", content: "", cover_image: "", short_description: "",
  category: "", author: "", tags: [], seo_title: "", seo_description: "",
  seo_keywords: "", canonical_url: "", status: "draft",
};

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_BLOG);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function fetchBlogs() {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (search) params.q = search;
    adminApi.blogs(params)
      .then(r => { setBlogs(r.blogs); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchBlogs(); }, [filterStatus, search]);

  function openNew() {
    setEditing("new");
    setForm(EMPTY_BLOG);
  }

  async function openEdit(id) {
    try {
      const b = await adminApi.getBlog(id);
      setForm({ ...EMPTY_BLOG, ...b, tags: b.tags || [] });
      setEditing(id);
    } catch (e) { alert(e.message); }
  }

  function closeEditor() { setEditing(null); setForm(EMPTY_BLOG); }

  async function handleSave() {
    if (!form.title || !form.slug) { alert("Title and slug are required"); return; }
    setSaving(true);
    try {
      if (editing === "new") {
        await adminApi.createBlog(form);
        setMsg("Blog created!");
      } else {
        await adminApi.updateBlog(editing, form);
        setMsg("Blog updated!");
      }
      fetchBlogs();
      closeEditor();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteBlog(id);
      setBlogs(b => b.filter(x => x.id !== id));
      setMsg("Blog deleted");
      if (editing === id) closeEditor();
    } catch (e) { alert(e.message); }
    setTimeout(() => setMsg(""), 2000);
  }

  async function quickStatus(id, status) {
    try {
      await adminApi.updateBlog(id, { status });
      fetchBlogs();
    } catch (e) { alert(e.message); }
  }

  const F = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  if (editing !== null) {
    return (
      <div className="flex flex-col h-full">
        {/* Editor header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3">
            <button onClick={closeEditor} className="text-gray-400 hover:text-white text-sm">← Back</button>
            <span className="text-gray-700">/</span>
            <h1 className="text-sm font-semibold text-white">{editing === "new" ? "New Blog" : "Edit Blog"}</h1>
          </div>
          <div className="flex items-center gap-3">
            {msg && <span className="text-emerald-400 text-sm">{msg}</span>}
            <select value={form.status} onChange={F("status")}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button onClick={handleSave} disabled={saving}
              className="bg-[#E25238] hover:bg-[#c94530] text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Main fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Title *</label>
                <input value={form.title} onChange={(e) => {
                  const v = e.target.value;
                  setForm(f => ({ ...f, title: v, slug: editing === "new" ? slugify(v) : f.slug }));
                }} placeholder="Blog post title"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Slug * (URL)</label>
                <input value={form.slug} onChange={F("slug")} placeholder="my-blog-post"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238] font-mono" />
                {form.slug && <p className="text-xs text-gray-600 mt-1">website.com/blog/{form.slug}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Author</label>
                <input value={form.author} onChange={F("author")} placeholder="Author name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Category</label>
                <input value={form.category} onChange={F("category")} placeholder="e.g. Creator Tips"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Tags (comma separated)</label>
                <input value={form.tags?.join(", ") || ""} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))}
                  placeholder="influencer, brand, marketing"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Cover Image URL</label>
                <input value={form.cover_image} onChange={F("cover_image")} placeholder="https://..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238]" />
              </div>
            </div>

            {/* Short description */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Short Description</label>
              <textarea value={form.short_description} onChange={F("short_description")} rows={2}
                placeholder="A brief summary of the post..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238] resize-none" />
            </div>

            {/* Content */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Content (HTML / Markdown)</label>
              <textarea value={form.content} onChange={F("content")} rows={14}
                placeholder="Write your blog content here..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238] resize-none font-mono" />
            </div>

            {/* SEO */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-white mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">SEO Title</label>
                  <input value={form.seo_title} onChange={F("seo_title")} placeholder="SEO-optimized title (50–60 chars)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238]" />
                  <p className="text-xs text-gray-600 mt-1">{form.seo_title?.length || 0}/60 chars</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Meta Description</label>
                  <textarea value={form.seo_description} onChange={F("seo_description")} rows={2}
                    placeholder="Meta description (150–160 chars)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238] resize-none" />
                  <p className="text-xs text-gray-600 mt-1">{form.seo_description?.length || 0}/160 chars</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">SEO Keywords</label>
                  <input value={form.seo_keywords} onChange={F("seo_keywords")} placeholder="keyword1, keyword2, keyword3"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Canonical URL</label>
                  <input value={form.canonical_url} onChange={F("canonical_url")} placeholder="https://website.com/blog/slug"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mt-1 text-sm focus:outline-none focus:border-[#E25238]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Blog CMS</h1>
          <p className="text-gray-500 text-sm">{total} total posts</p>
        </div>
        <button onClick={openNew}
          className="bg-[#E25238] hover:bg-[#c94530] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          + New Blog
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search blogs..."
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#E25238] w-64" />
        {["", "draft", "published"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === s
              ? "bg-[#E25238] text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Blog list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-600">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center h-32 text-gray-600">
            No blogs yet — create your first post!
          </div>
        ) : blogs.map(b => (
          <div key={b.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex items-start gap-4 hover:border-gray-700 transition-colors">
            {b.cover_image && (
              <img src={b.cover_image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-white font-semibold text-sm">{b.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">/{b.slug} · {b.author || "—"}</p>
                  {b.short_description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{b.short_description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    b.status === "published"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-gray-700/40 text-gray-400 border-gray-700/40"
                  }`}>{b.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-gray-600">{new Date(b.created_at).toLocaleDateString()}</span>
                {b.tags?.length > 0 && (
                  <div className="flex gap-1">
                    {b.tags.slice(0, 3).map(t => <span key={t} className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                )}
                <div className="ml-auto flex gap-2">
                  {b.status === "draft" ? (
                    <button onClick={() => quickStatus(b.id, "published")}
                      className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-colors">
                      Publish
                    </button>
                  ) : (
                    <button onClick={() => quickStatus(b.id, "draft")}
                      className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-gray-700 transition-colors">
                      Unpublish
                    </button>
                  )}
                  <button onClick={() => openEdit(b.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(b.id, b.title)}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

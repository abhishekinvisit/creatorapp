import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/blog/categories")
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: "20", offset: "0" });
    if (category) params.set("category", category);
    fetch(`/api/blog?${params}`)
      .then(r => { if (!r.ok) throw new Error("Failed to load"); return r.json(); })
      .then(d => { setBlogs(d.blogs || []); setTotal(d.total || 0); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-[#F9F9F8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 text-sm mt-1">Tips, guides, and updates from Rytspot</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory("")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === ""
                  ? "bg-[#E25238] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#E25238] hover:text-[#E25238]"
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === c
                    ? "bg-[#E25238] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#E25238] hover:text-[#E25238]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Loading posts...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">No posts published yet</p>
          </div>
        )}

        {/* Blog cards */}
        {!loading && !error && blogs.map(b => (
          <button
            key={b.id}
            onClick={() => navigate(`/blog/${b.slug}`)}
            className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#E25238]/30 hover:shadow-md transition-all text-left"
          >
            {b.cover_image && (
              <img
                src={b.cover_image}
                alt={b.title}
                className="w-full h-44 object-cover"
                onError={e => { e.target.style.display = "none"; }}
              />
            )}
            <div className="p-5">
              {b.category && (
                <span className="text-xs font-semibold text-[#E25238] uppercase tracking-wider">
                  {b.category}
                </span>
              )}
              <h2 className="text-base font-bold text-gray-900 mt-1 leading-snug">{b.title}</h2>
              {b.short_description && (
                <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">{b.short_description}</p>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                {b.author && <span>{b.author}</span>}
                {b.author && <span>·</span>}
                <span>
                  {new Date(b.published_at || b.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </span>
                {b.tags?.length > 0 && (
                  <>
                    <span>·</span>
                    <div className="flex gap-1">
                      {b.tags.slice(0, 2).map(t => (
                        <span key={t} className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Total count */}
        {!loading && !error && blogs.length > 0 && (
          <p className="text-center text-xs text-gray-400">{total} post{total !== 1 ? "s" : ""} published</p>
        )}
      </div>
    </div>
  );
}

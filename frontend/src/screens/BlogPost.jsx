import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/blog/${slug}`)
      .then(r => {
        if (r.status === 404) throw new Error("Post not found");
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(d => setPost(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-4xl">📄</div>
        <p className="text-gray-700 font-semibold">
          {error === "Post not found" ? "Post not found" : "Something went wrong"}
        </p>
        <p className="text-gray-400 text-sm text-center">
          {error === "Post not found"
            ? "This blog post may have been removed or the link is incorrect."
            : error}
        </p>
        <button
          onClick={() => navigate("/blog")}
          className="mt-2 px-4 py-2 bg-[#E25238] text-white text-sm font-semibold rounded-xl hover:bg-[#c94530] transition-colors"
        >
          Browse all posts
        </button>
      </div>
    );
  }

  if (!post) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(post.content || "");

  return (
    <div className="min-h-screen bg-[#F9F9F8]">
      {/* Back nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/blog")}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            ← Blog
          </button>
          {post.category && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-xs font-semibold text-[#E25238] uppercase tracking-wider">{post.category}</span>
            </>
          )}
        </div>
      </div>

      {/* Hero image */}
      {post.cover_image && (
        <div className="w-full max-h-72 overflow-hidden bg-gray-100">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.parentElement.style.display = "none"; }}
          />
        </div>
      )}

      {/* Article */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Meta */}
        <div className="mb-6">
          {post.category && (
            <span className="text-xs font-semibold text-[#E25238] uppercase tracking-wider">
              {post.category}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mt-2 leading-tight">{post.title}</h1>
          {post.short_description && (
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">{post.short_description}</p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 flex-wrap">
            {post.author && <span className="font-medium text-gray-600">{post.author}</span>}
            {post.author && <span>·</span>}
            <span>
              {new Date(post.published_at || post.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </span>
            {post.tags?.length > 0 && (
              <>
                <span>·</span>
                <div className="flex gap-1 flex-wrap">
                  {post.tags.map(t => (
                    <span key={t} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* Content */}
        {post.content ? (
          isHtml ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                prose-a:text-[#E25238] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-blockquote:border-l-[#E25238] prose-blockquote:text-gray-500
                prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm
                prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          )
        ) : (
          <p className="text-gray-400 italic text-sm">No content available.</p>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/blog")}
            className="text-sm text-[#E25238] font-semibold hover:underline"
          >
            ← Back to all posts
          </button>
        </div>
      </div>
    </div>
  );
}

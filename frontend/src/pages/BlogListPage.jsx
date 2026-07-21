import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { supabase } from '../lib/supabase';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (!cancelled) {
        if (error) {
          console.error(error);
          setPosts([]);
        } else {
          setPosts(data ?? []);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <SEOHead
        title="Blog – USJ Technologies"
        description="Read buying guides, product insights, and updates from USJ Technologies about networking, government procurement, and technology solutions."
        canonical="/blog"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': 'USJ Technologies Blog',
          'description': 'Latest articles from USJ Technologies',
          'url': 'https://usjtechnologies.com/blog',
          'itemListElement': posts.map((post, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': post.title,
            'url': `https://usjtechnologies.com/blog/${post.slug}`,
          })),
        }}
      />

      <section className="border-b border-[#E2E8F0] bg-white py-8">
        <div className="container-max">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628]">From the Blog</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#718096]">
            Practical insights for government buyers, enterprise teams, and businesses looking for trusted technology guidance.
          </p>
        </div>
      </section>

      <section className="section-py">
        <div className="container-max">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-[12px] border border-[#E2E8F0] bg-white" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-10 text-center text-sm text-[#718096]">
              No published posts yet. Please check back soon.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white shadow-sm transition-transform hover:-translate-y-1">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-[#F8F9FA] text-sm font-semibold text-[#718096]">
                      USJ Insights
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#718096]">
                      {post.category && <span className="rounded-full bg-[#F8F9FA] px-2.5 py-0.5">{post.category}</span>}
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={12} /> {formatDate(post.published_at || post.created_at)}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-[#0A1628]">{post.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#4A5568]">{post.excerpt || 'Read more about this topic from USJ Technologies.'}</p>
                    <Link to={`/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0A1628] hover:text-[#C9A84C]">
                      Read article <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

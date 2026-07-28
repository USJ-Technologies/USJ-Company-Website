import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Package } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { supabase } from '../lib/supabase';
import BlogPostActionBar from '../components/blog/BlogPostActionBar';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://usjtechnologies.com';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInlineMarkdown(text) {
  let html = escapeHtml(text || '');
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-bold underline decoration-2 underline-offset-2 text-[#0A1628] hover:text-[#C9A84C]">$1</a>'
  );
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  return html.replace(/\n/g, '<br />');
}

function renderContent(markdown) {
  const blocks = String(markdown || '').split(/\n{2,}/).filter(Boolean);
  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (/^#{1}\s+/.test(trimmed)) {
      return <h1 key={index} className="text-2xl font-bold text-[#0A1628] mt-6 mb-3">{trimmed.replace(/^#{1}\s+/, '')}</h1>;
    }
    if (/^#{2}\s+/.test(trimmed)) {
      return <h2 key={index} className="text-xl font-semibold text-[#0A1628] mt-5 mb-2">{trimmed.replace(/^#{2}\s+/, '')}</h2>;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      const items = trimmed.split(/\n/).filter(Boolean).map((item) => item.replace(/^[-*]\s+/, '').trim());
      return (
        <ul key={index} className="list-disc pl-6 space-y-2 text-[#4A5568] leading-relaxed">
          {items.map((item, itemIndex) => <li key={itemIndex} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} />)}
        </ul>
      );
    }

    return <p key={index} className="text-[#4A5568] leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmed) }} />;
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (!cancelled) {
        if (error || !data) {
          setPost(null);
        } else {
          setPost(data);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen py-16">
        <div className="container-max rounded-[12px] border border-[#E2E8F0] bg-white p-8 text-sm text-[#718096]">
          Loading article…
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen py-16">
        <div className="container-max rounded-[12px] border border-[#E2E8F0] bg-white p-10 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Article Not Found</h2>
          <p className="text-[#718096] mb-6">The article you're looking for may have moved or is no longer published.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 rounded-[6px] bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A2E4A]">
            <ArrowLeft size={15} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const description = post.excerpt || post.content?.slice(0, 180).replace(/\s+/g, ' ').trim();
  const canonical = `/blog/${post.slug}`;
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.title,
    'description': description,
    'image': post.cover_image ? [post.cover_image] : undefined,
    'datePublished': post.published_at || post.created_at,
    'dateModified': post.updated_at || post.published_at || post.created_at,
    'author': { '@type': 'Organization', 'name': 'USJ Technologies' },
    'publisher': { '@type': 'Organization', 'name': 'USJ Technologies', 'logo': { '@type': 'ImageObject', 'url': `${SITE_URL}/og-image.jpeg` } },
    'mainEntityOfPage': { '@type': 'WebPage', '@id': `${SITE_URL}${canonical}` },
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${SITE_URL}/blog` },
      { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': `${SITE_URL}${canonical}` },
    ],
  };



  return (
    <>
      <SEOHead
        title={post.title}
        description={description}
        canonical={canonical}
        ogType="article"
        ogImage={post.cover_image || undefined}
        structuredData={{ '@context': 'https://schema.org', '@graph': [articleStructuredData, breadcrumbStructuredData] }}
      />

      <div className="bg-[#F8F9FA] min-h-screen py-8 md:py-12">
        <div className="container-max max-w-6xl">
          <nav className="mb-6 flex items-center gap-2 text-sm text-[#718096]">
            <Link to="/" className="hover:text-[#0A1628]">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-[#0A1628]">Blog</Link>
            <span>/</span>
            <span className="text-[#0A1628]">{post.title}</span>
          </nav>

          <article>
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="h-72 md:h-96 w-full object-contain bg-[#0A1628] rounded-lg mb-6"
              />
            )}

            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#718096]">
              {post.category && <span className="rounded-full bg-[#EDF2F7] px-2.5 py-0.5">{post.category}</span>}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF2F7] px-2.5 py-0.5">
                <CalendarDays size={12} /> {formatDate(post.published_at || post.created_at)}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] leading-tight">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-lg text-[#4A5568]">{post.excerpt}</p>}

            {/* Action bar */}
            <BlogPostActionBar post={post} />

            <div className="prose prose-slate mt-8 max-w-none text-[#4A5568]">
              {renderContent(post.content)}
            </div>

            <div className="mt-10 rounded-[10px] border border-[#E2E8F0] bg-[#F8F9FA] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1628]">Need help sourcing the right solution?</h2>
              <p className="mt-2 text-sm text-[#4A5568]">Visit our shop to explore trusted products and request a quote for your project.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/shop" className="rounded-[6px] bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A2E4A]">Browse products</Link>
                <Link to="/contact" className="rounded-[6px] border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0A1628] hover:bg-white">Contact USJ</Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

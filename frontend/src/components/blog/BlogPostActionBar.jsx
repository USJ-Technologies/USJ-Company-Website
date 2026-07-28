import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Edit3, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import Modal from '../ui/Modal';

/**
 * Action bar with Comment, Suggest Edit, and Share for a blog post.
 * @param {{ post: object }} props
 */
export default function BlogPostActionBar({ post }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef(null);

  // Close share popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const postUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/blog/${post.slug}`
    : `/blog/${post.slug}`;

  // --- Handlers ---
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('techteam@usjtechnologies.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: postUrl });
      } catch {
        // user cancelled
      }
    } else {
      setShareOpen((v) => !v);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
    } catch { /* noop */ }
    setShareOpen(false);
  };

  const iconBtnClass =
    'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#718096] transition-colors hover:text-[#0A1628] hover:bg-[#F0F0F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]';

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 border-y border-[#E2E8F0] py-2 mt-5">
        {/* Comment (stub) — TODO: needs comments table/UI */}
        <button
          type="button"
          className={iconBtnClass}
          onClick={() => {/* stub: scroll to comments placeholder or no-op */}}
          aria-label="Comment"
        >
          <MessageCircle size={15} strokeWidth={1.8} />
          <span className="hidden sm:inline">Comment</span>
        </button>

        {/* Suggest an edit */}
        <button
          type="button"
          className={iconBtnClass}
          onClick={() => setEditModalOpen(true)}
          aria-label="Suggest an edit"
        >
          <Edit3 size={15} strokeWidth={1.8} />
          <span className="hidden sm:inline">Suggest edit</span>
        </button>

        {/* Share */}
        <div className="relative ml-auto" ref={shareRef}>
          <button
            type="button"
            className={iconBtnClass}
            onClick={handleShare}
            aria-label="Share"
          >
            <Share2 size={15} strokeWidth={1.8} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Share popover (fallback when navigator.share is unavailable) */}
          {shareOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 min-w-[200px] rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-lg">
              <p className="text-xs font-semibold text-[#0A1628] mb-2">Share this article</p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-[#4A5568] hover:text-[#0A1628] transition-colors"
                  onClick={handleCopyLink}
                >
                  <Copy size={14} /> Copy link
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#4A5568] hover:text-[#0A1628] transition-colors"
                >
                  <ExternalLink size={14} /> WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#4A5568] hover:text-[#0A1628] transition-colors"
                >
                  <ExternalLink size={14} /> Twitter / X
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggest-edit modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Suggest an Edit" size="sm">
        <p className="text-sm text-[#4A5568] mb-4">
          Found an issue or have a suggestion for this article? Email our team.
        </p>
        <div className="flex items-center gap-2 rounded-md bg-[#F8F9FA] px-3 py-2 text-sm font-medium text-[#0A1628] mb-4 select-all">
          techteam@usjtechnologies.com
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-medium text-[#0A1628] hover:bg-[#F8F9FA] transition-colors"
            onClick={handleCopyEmail}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy email'}
          </button>
          <a
            href={`mailto:techteam@usjtechnologies.com?subject=${encodeURIComponent('Suggested edit: ' + post.title)}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0A1628] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1A2E4A] transition-colors"
          >
            <ExternalLink size={14} />
            Send email
          </a>
        </div>
      </Modal>
    </>
  );
}

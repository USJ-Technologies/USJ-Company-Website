import { useState, useEffect, useRef } from 'react';
import { Share2, Link as LinkIcon, Check, X, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

/*
 * ShareButton
 * -----------
 * Shares a product link. On devices that support the Web Share API (most phones)
 * it opens the native share sheet — that's the path to WhatsApp, Instagram, etc.
 * On desktop it falls back to a small popover with direct share targets and a
 * copy-link action.
 *
 * The rich link preview (product image + title) shown in WhatsApp/Facebook/etc.
 * is produced server-side by /api/og — see frontend/api/og.js. This button only
 * hands the URL to the target app.
 */

function buildTargets({ url, title, text }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const body = encodeURIComponent(`${text}\n\n${url}`);
  return [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
      color: '#25D366',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      color: '#1877F2',
    },
    {
      key: 'x',
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      color: '#0F1419',
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      color: '#0A66C2',
    },
    {
      key: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${u}&text=${t}`,
      color: '#26A5E4',
    },
    {
      key: 'email',
      label: 'Email',
      href: `mailto:?subject=${t}&body=${body}`,
      color: '#718096',
    },
  ];
}

// Simple brand glyphs so we don't add an icon dependency; email uses lucide.
function TargetIcon({ target, size = 16 }) {
  if (target.key === 'email') return <Mail size={size} />;
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full text-white font-bold"
      style={{ backgroundColor: target.color, width: size + 8, height: size + 8, fontSize: size - 4 }}
    >
      {target.label[0]}
    </span>
  );
}

export default function ShareButton({ url, title, text, className = '' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || 'Check out this product';
  const shareText = text || shareTitle;
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const handleClick = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (err) {
        // AbortError = user dismissed the sheet; anything else falls back to the menu.
        if (err?.name === 'AbortError') return;
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const targets = buildTargets({ url: shareUrl, title: shareTitle, text: shareText });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Share this product"
        aria-haspopup={!canNativeShare}
        aria-expanded={open}
        className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-[#E2E8F0] text-[#4A5568] hover:text-[#0A1628] hover:border-[#0A1628] transition-colors ${className}`}
      >
        <Share2 size={16} />
        <span className="hidden sm:inline text-sm font-medium">Share</span>
      </button>

      {open && !canNativeShare && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 bg-white rounded-xl border border-[#E2E8F0] shadow-lg p-2"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#718096]">Share via</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded text-[#718096] hover:text-[#0A1628]"
              aria-label="Close share menu"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1">
            {targets.map((tgt) => (
              <a
                key={tgt.key}
                href={tgt.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-[#0A1628] hover:bg-[#F8F9FA] transition-colors"
                role="menuitem"
              >
                <TargetIcon target={tgt} />
                {tgt.label}
              </a>
            ))}

            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-[#0A1628] hover:bg-[#F8F9FA] transition-colors border-t border-[#E2E8F0] mt-1 pt-2.5"
              role="menuitem"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F0F0F0]">
                {copied ? <Check size={14} className="text-green-600" /> : <LinkIcon size={14} />}
              </span>
              {copied ? 'Link copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

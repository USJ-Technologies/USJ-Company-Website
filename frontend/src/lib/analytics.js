import { supabase } from './supabase';

const ANALYTICS_SESSION_KEY = 'usj_analytics_session_id';
const ANALYTICS_SESSION_STARTED_AT_KEY = 'usj_session_started_at';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function getSessionId() {
  if (typeof window === 'undefined') return null;

  let sessionId = localStorage.getItem(ANALYTICS_SESSION_KEY);
  const startedAt = localStorage.getItem(ANALYTICS_SESSION_STARTED_AT_KEY);

  if (!sessionId) {
    try {
      sessionId = crypto.randomUUID();
    } catch {
      sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }
    localStorage.setItem(ANALYTICS_SESSION_KEY, sessionId);
    localStorage.setItem(ANALYTICS_SESSION_STARTED_AT_KEY, new Date().toISOString());
  } else if (!startedAt) {
    localStorage.setItem(ANALYTICS_SESSION_STARTED_AT_KEY, new Date().toISOString());
  }

  return sessionId;
}

export function trackEvent(eventName, metadata = {}) {
  if (!eventName) return;

  const sessionId = getSessionId();

  supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      const userId = session?.user?.id ?? null;
      return supabase.from('analytics_events').insert({
        event_name: eventName,
        user_id: userId,
        session_id: sessionId,
        metadata: Object.keys(metadata ?? {}).length ? metadata : null,
      });
    })
    .catch((error) => {
      console.warn('Analytics tracking failure:', error);
    });
}

function buildSessionEndPayload() {
  if (typeof window === 'undefined') return null;

  const sessionId = localStorage.getItem(ANALYTICS_SESSION_KEY);
  const startedAt = localStorage.getItem(ANALYTICS_SESSION_STARTED_AT_KEY);
  if (!sessionId || !startedAt) return null;

  const startTime = new Date(startedAt).getTime();
  if (Number.isNaN(startTime)) return null;

  const durationSeconds = Math.max(0, Math.round((Date.now() - startTime) / 1000));
  return {
    event_name: 'session_end',
    user_id: null,
    session_id: sessionId,
    metadata: { duration_seconds: durationSeconds },
  };
}

function sendBeaconPayload(url, payload) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (navigator.sendBeacon(url, blob)) return true;
    }
  } catch {
    // ignore and fall back
  }

  if (typeof XMLHttpRequest !== 'undefined') {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(payload));
      return xhr.status >= 200 && xhr.status < 300;
    } catch {
      return false;
    }
  }

  return false;
}

export function trackSessionEndBeacon() {
  if (typeof window === 'undefined' || !SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  const payload = buildSessionEndPayload();
  if (!payload) return;

  const beaconUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/analytics_events?apikey=${encodeURIComponent(SUPABASE_ANON_KEY)}`;
  sendBeaconPayload(beaconUrl, payload);
}

export function trackSessionEnd() {
  if (typeof window === 'undefined') return;

  const payload = buildSessionEndPayload();
  if (!payload) return;

  supabase.from('analytics_events').insert(payload).catch((error) => {
    console.warn('Analytics tracking failure:', error);
  });
}

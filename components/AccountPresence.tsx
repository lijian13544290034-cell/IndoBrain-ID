'use client';

import { useEffect } from 'react';

export default function AccountPresence() {
  useEffect(() => {
    const heartbeat = () => { void fetch('/api/auth/presence', { method: 'POST' }); };
    heartbeat();
    const interval = window.setInterval(heartbeat, 60_000);
    return () => window.clearInterval(interval);
  }, []);
  return null;
}

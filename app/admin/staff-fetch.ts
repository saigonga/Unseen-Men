'use client';

let refreshInFlight: Promise<boolean> | null = null;

export function refreshStaffSession() {
  if (!refreshInFlight) {
    refreshInFlight = fetch('/api/admin/refresh', { method: 'POST', cache: 'no-store' })
      .then(response => response.ok)
      .catch(() => false)
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export async function staffFetch(input: RequestInfo | URL, init?: RequestInit) {
  let response = await fetch(input, init);
  if (response.status === 401 && await refreshStaffSession()) response = await fetch(input, init);
  return response;
}

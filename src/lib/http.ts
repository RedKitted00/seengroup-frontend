export interface RetryOptions {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  backoffFactor?: number;
}

export async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit = {}, opts: RetryOptions = {}) {
  const {
    retries = 2,
    retryDelayMs = 500,
    timeoutMs = 8000,
    backoffFactor = 2,
  } = opts;

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(id);

      if (!res.ok && res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * Math.pow(backoffFactor, attempt)));
        attempt += 1;
        continue;
      }

      return res;
    } catch (err) {
      clearTimeout(id);
      lastError = err;
      if (attempt >= retries) break;
      await new Promise((r) => setTimeout(r, retryDelayMs * Math.pow(backoffFactor, attempt)));
      attempt += 1;
    }
  }

  throw lastError ?? new Error('Request failed');
}



/**
 * ==========================================================================
 * File: /api/shared/api-client.js
 * Description: Unified API Client for Apps Script Stateless JSON Routing
 * Compatibility: Preserves method signature request(action, payload, logicalMethod)
 * and does not alter the logical parameter parsing or Google Apps Script JSON payloads.
 *
 * Upgrades in this revision (non-breaking):
 *   - Request timeout via AbortController (Apps Script can hang or cold-start slowly)
 *   - Automatic retry with backoff, but ONLY for safe/idempotent GET reads —
 *     POST/PUT/DELETE are never auto-retried, to avoid duplicate orders/writes
 *   - Distinct, user-friendly error types: timeout, offline, http, server, parse
 *   - Defensive JSON parsing (Apps Script sometimes returns an HTML error page
 *     instead of JSON on quota/auth failure — that used to throw a cryptic
 *     "Unexpected token <" error with no useful message for the UI)
 * ==========================================================================
 */

const ApiClient = {
  // Global loading states trackers for frontend progress indicators
  activeRequests: 0,

  // Tunable network policy — safe defaults for a Google Apps Script backend
  TIMEOUT_MS: 15000,
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 600,

  /**
   * Asynchronously dispatches a stateless request to the backend.
   *
   * @param {string} action Logical action route, e.g., 'products.list'
   * @param {Object} [payload={}] Payload parameters for the request
   * @param {string} [logicalMethod='POST'] 'GET' | 'POST' | 'PUT' | 'DELETE'
   * @returns {Promise<Object>} Standard API Response payload
   */
  async request(action, payload = {}, logicalMethod = 'POST') {
    const cleanMethod = logicalMethod.toUpperCase();
    const isIdempotent = cleanMethod === 'GET';
    const maxAttempts = isIdempotent ? this.MAX_RETRIES + 1 : 1;

    this.toggleLoader_(true);

    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.dispatch_(action, payload, cleanMethod);
        this.toggleLoader_(false);
        return result;
      } catch (error) {
        lastError = error;

        // Never retry writes, and never retry a request the server understood
        // and explicitly rejected (e.g. validation error, invalid token).
        const retryable = isIdempotent && error.type !== 'server' && attempt < maxAttempts;
        if (!retryable) break;

        await this.delay_(this.RETRY_DELAY_MS * attempt);
      }
    }

    this.toggleLoader_(false);
    console.error(`ApiClient request failure [Action: ${action}, Method: ${logicalMethod}]:`, lastError);
    throw lastError;
  },

  /**
   * Executes a single network attempt. Split out from request() so retry
   * logic stays simple and doesn't duplicate the fetch/parse pipeline.
   * @private
   */
  async dispatch_(action, payload, cleanMethod) {
    const session = typeof StorageHelper !== 'undefined'
      ? StorageHelper.get(ENV.STORAGE_KEYS.SESSION, null)
      : null;
    const token = session ? session.token : null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      let response;

      if (cleanMethod === 'GET') {
        const urlParams = new URLSearchParams({
          version: ENV.API_VERSION,
          action: action,
          payload: JSON.stringify(payload)
        });
        if (token) urlParams.append('token', token);

        response = await fetch(`${ENV.API_URL}?${urlParams.toString()}`, {
          method: 'GET',
          signal: controller.signal
        });
      } else {
        const requestBody = {
          version: ENV.API_VERSION,
          action: action,
          payload: payload,
          token: token,
          method: cleanMethod
        };

        response = await fetch(ENV.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Standard CORS workaround for Apps Script POST bodies
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
      }

      if (!response.ok) {
        const err = new Error(`HTTP Error Status: ${response.status}`);
        err.type = 'http';
        err.status = response.status;
        throw err;
      }

      const rawText = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(rawText);
      } catch (parseError) {
        const err = new Error('The server returned an unreadable response. Please try again shortly.');
        err.type = 'parse';
        throw err;
      }

      if (responseJson && responseJson.success === false) {
        const err = new Error(responseJson.message || 'The server returned an unsuccessful state.');
        err.type = 'server';
        err.code = responseJson.code;
        throw err;
      }

      return responseJson;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutErr = new Error('The request timed out. Please check your connection and try again.');
        timeoutErr.type = 'timeout';
        throw timeoutErr;
      }
      if (!navigator.onLine) {
        const offlineErr = new Error('You appear to be offline. Please reconnect and try again.');
        offlineErr.type = 'offline';
        throw offlineErr;
      }
      if (!error.type) error.type = 'network';
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /** @private */
  delay_(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Internal helper to dispatch load-state changes to the DOM.
   * @private
   */
  toggleLoader_(isLoading) {
    if (isLoading) {
      this.activeRequests++;
    } else {
      this.activeRequests = Math.max(0, this.activeRequests - 1);
    }

    const hasActiveRequests = this.activeRequests > 0;
    window.dispatchEvent(new CustomEvent('api-loading', {
      detail: { loading: hasActiveRequests }
    }));
  }
};

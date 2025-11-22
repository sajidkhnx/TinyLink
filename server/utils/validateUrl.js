export default function validateUrl(url) {
  // Normalize and validate the URL. If input lacks a scheme, attempt to
  // prepend http:// and validate again. Return the normalized URL string
  // on success, or false on failure. Reject hostnames without a dot
  // (e.g. "hello") except for localhost and IPv4 addresses.
  try {
    let normalized = url;
    let parsed;
    try {
      parsed = new URL(normalized);
    } catch {
      normalized = `http://${normalized}`;
      parsed = new URL(normalized);
    }

    // Only allow http or https schemes
    if (!/^https?:$/.test(parsed.protocol)) return false;

    const host = parsed.hostname;

    const isLocalhost = host === "localhost";
    const isIPv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
    const hasDot = host.includes(".");

    if (!(isLocalhost || isIPv4 || hasDot)) return false;

    return parsed.href;
  } catch {
    return false;
  }
}

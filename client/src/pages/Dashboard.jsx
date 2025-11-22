import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE;

function getShortBase(api) {
  // Prefer the API base (strip any trailing /api), otherwise fall back to current origin
  if (api) {
    try {
      const u = new URL(api);
      const path = u.pathname.replace(/\/api\/?$/i, "");
      return `${u.origin}${path}`.replace(/\/$/, "");
    } catch {
      // fallthrough
    }
  }
  return window.location.origin;
}

function isLikelyUrl(value) {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    try {
      new URL(`http://${value}`);
      return true;
    } catch {
      return false;
    }
  }
}

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  

  const SHORT_BASE = getShortBase(API);

  const loadLinks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/links`);
      setLinks(res.data || []);
    } catch (err) {
      setError("Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!url) return setError("Please enter a target URL.");
    if (!isLikelyUrl(url)) return setError("Invalid URL");

    const codeRegex = /^[A-Za-z0-9]{6,8}$/;
    if (code && !codeRegex.test(code)) return setError("Custom code must be 6-8 alphanumeric characters.");

    setCreating(true);
    try {
      const res = await axios.post(`${API}/links`, { targetUrl: url, code });
      setSuccess("Short link created");
      setUrl("");
      setCode("");
      loadLinks();
      const full = `${SHORT_BASE}/${res.data.code}`;
      try { await navigator.clipboard.writeText(full); setCopied(res.data.code); setTimeout(()=>setCopied(""),1500);}catch(e){}
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create link");
    } finally {
      setCreating(false);
    }
  };

  const deleteLink = async (c) => {
    if (!window.confirm(`Delete ${c}?`)) return;
    try {
      await axios.delete(`${API}/links/${c}`);
      loadLinks();
    } catch (err) {
      setError(err.response?.data?.error || "Error deleting");
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    const out = links.filter((l) => l.code.toLowerCase().includes(s) || l.targetUrl.toLowerCase().includes(s));
    const rev = sortDir === 'asc' ? 1 : -1;
    out.sort((a, b) => {
      if (sortBy === 'clicks') return (a.totalClicks - b.totalClicks) * rev;
      if (sortBy === 'code') return a.code.localeCompare(b.code) * rev;
      // default: createdAt
      return (new Date(a.createdAt) - new Date(b.createdAt)) * rev;
    });
    return out;
  }, [links, search, sortBy, sortDir]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">Manage your short links</div>
      </div>

      <form onSubmit={createLink} className="bg-white p-4 shadow rounded mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Target URL</label>
          <input className="w-full p-2 border rounded mt-1" placeholder="https://example.com/very/long/path" value={url} onChange={(e)=>setUrl(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-600">Custom Code (optional)</label>
          <input className="w-full p-2 border rounded mt-1" placeholder="6-8 chars" value={code} onChange={(e)=>setCode(e.target.value)} />
        </div>

        <div>
          <button disabled={creating} className={`w-full px-4 py-2 rounded ${creating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>{creating ? 'Creating...' : 'Shorten'}</button>
        </div>

        <div className="md:col-span-4">
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          {success && <div className="text-sm text-green-600 mt-2">{success} — copied to clipboard</div>}
        </div>
      </form>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <input className="p-2 border rounded w-full md:w-1/3" placeholder="Search by code or URL..." value={search} onChange={(e)=>setSearch(e.target.value)} />

        <div className="flex items-center space-x-2 text-sm">
          <button onClick={(e)=>{e.preventDefault(); loadLinks();}} disabled={loading} className={`px-3 py-2 rounded ${loading ? 'bg-gray-300 text-gray-600' : 'bg-white border hover:bg-gray-50'}`}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          <label className="text-gray-600">Sort</label>
          <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="p-1 border rounded">
            <option value="createdAt">Newest</option>
            <option value="clicks">Clicks</option>
            <option value="code">Code</option>
          </select>
          <button onClick={(e)=>{e.preventDefault(); setSortDir(s=> s==='asc' ? 'desc' : 'asc')}} className="p-1 border rounded">{sortDir==='asc' ? '↑' : '↓'}</button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading links…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No links yet — create your first short link above.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-3">Short Code</th>
                <th className="p-3">Target URL</th>
                <th className="p-3">Total clicks </th>
                <th className="p-3">Last Clicked Time</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((l) => (
                <tr key={l.code} className="border-t">
                  <td className="p-3 align-top font-medium text-gray-800">{l.code}</td>
                  <td className="p-3 align-top max-w-[30ch] truncate text-blue-600">
                    <a href={`${SHORT_BASE}/${l.code}`} target="_blank" rel="noreferrer" className="hover:underline block truncate max-w-full">{`${SHORT_BASE}/${l.code}`}</a>
                  </td>
                  {/* <td className="p-3 align-top max-w-[40ch] truncate text-blue-600">
                    <a href={l.targetUrl} target="_blank" rel="noreferrer" className="hover:underline block truncate max-w-full">{l.targetUrl}</a>
                  </td> */}
                  <td className="p-3 align-top">{l.totalClicks}</td>
                  <td className="p-3 align-top">{l.lastClicked ? new Date(l.lastClicked).toLocaleString() : '—'}</td>
                  <td className="p-3 align-top space-x-2">
                    <a className="text-sm text-blue-600 hover:underline" href={`/code/${l.code}`}>Stats</a>
                    <button className="text-sm text-red-600" onClick={()=>deleteLink(l.code)}>Delete</button>
                    <button className="text-sm text-gray-700" onClick={async ()=>{ try{ await navigator.clipboard.writeText(`${SHORT_BASE}/${l.code}`); setCopied(l.code); setTimeout(()=>setCopied(''),1200);}catch(e){}}}>{copied===l.code ? 'Copied' : 'Copy'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

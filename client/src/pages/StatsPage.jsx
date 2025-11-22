import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE;

export default function StatsPage() {
  const { code } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get(`${API}/links/${code}`)
      .then((res) => setLink(res.data))
      .catch(() => setError("Not found"))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="p-6 max-w-xl mx-auto text-gray-500">Loading…</div>;
  if (error || !link) return <div className="p-6 max-w-xl mx-auto text-red-600">{error || 'Not found'}</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Stats for {code}</h1>
        <RouterLink to="/" className="text-sm text-blue-600">Back</RouterLink>
      </div>

      <div className="bg-white p-4 shadow rounded space-y-3">
        <div>
          <div className="text-sm text-gray-600">Orignal URL</div>
          <a href={link.targetUrl} target="_blank" rel="noreferrer" className="text-blue-600 break-all">{link.targetUrl}</a>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Clicks</div>
            <div className="font-medium">{link.totalClicks}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Last Clicked</div>
            <div className="font-medium">{link.lastClicked ? new Date(link.lastClicked).toLocaleString() : '—'}</div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600">Created At</div>
          <div className="font-medium">{new Date(link.createdAt).toLocaleString()}</div>
        </div>

        <div className="flex space-x-2">
          <a className="px-3 py-2 bg-blue-600 text-white rounded" href={link.targetUrl} target="_blank" rel="noreferrer">Open target</a>
        </div>
      </div>
    </div>
  );
}

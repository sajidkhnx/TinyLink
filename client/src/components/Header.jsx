import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-extrabold text-gray-800">TinyLink</div>
          <div className="text-sm text-gray-500">Shorten & share links</div>
        </div>

        <nav className="space-x-4 text-sm">
          <Link to="/" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
         
          <span className="text-gray-400">|</span>
           <a target="blank" className="text-blue-600 hover:underline"href="https://tinylink-hspl.onrender.com/healthz">Healthz</a>
        </nav>
      </div>
    </header>
  );
}

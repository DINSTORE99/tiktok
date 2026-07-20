import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-cyan-400">
          VPN STORE
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/">Home</Link>
          <Link href="/products">Produk</Link>
          <Link href="/deposit">Deposit</Link>
          <Link href="/history">History</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
    </nav>
  );
}

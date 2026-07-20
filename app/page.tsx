import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">

        <h1 className="text-5xl font-bold text-cyan-400">
          VPN STORE
        </h1>

        <p className="mt-4 text-gray-400">
          Order VPN Otomatis
        </p>

        <div className="mt-10 flex gap-4 justify-center">

          <Link
            href="/login"
            className="bg-cyan-500 px-6 py-3 rounded-xl hover:bg-cyan-600"
          >
            Login
          </Link>

          <Link
            href="/products"
            className="border border-cyan-500 px-6 py-3 rounded-xl"
          >
            Produk
          </Link>

        </div>

      </div>
    </main>
  );
}

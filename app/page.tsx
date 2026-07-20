import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="text-5xl font-bold text-cyan-400">
          VPN STORE
        </h1>

        <p className="mt-5 max-w-xl text-gray-400">
          Website Order VPN Otomatis dengan Login Google, QRIS,
          Deposit Saldo, Reseller, dan Admin Panel.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/products"
            className="rounded-xl bg-cyan-500 px-6 py-3"
          >
            Order Sekarang
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-cyan-500 px-6 py-3"
          >
            Login
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

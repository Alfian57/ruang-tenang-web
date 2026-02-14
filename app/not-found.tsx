import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 badge */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-red-500">404</span>
        </div>

        <h1 className="text-2xl font-semibold text-foreground">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-muted-foreground text-sm">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-red-600"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

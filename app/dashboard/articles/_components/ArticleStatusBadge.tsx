export function getStatusBadge(status: string) {
  switch (status) {
    case "published":
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Dipublikasikan</span>;
    case "draft":
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draf</span>;
    case "pending":
      return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">Menunggu Persetujuan</span>;
    case "blocked":
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Diblokir</span>;
    case "rejected":
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Ditolak</span>;
    case "revision_needed":
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Perlu Revisi</span>;
    default:
      return null;
  }
}

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { B2BInviteClient } from "./B2BInviteClient";

export default function B2BInvitePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        </main>
      }
    >
      <B2BInviteClient />
    </Suspense>
  );
}

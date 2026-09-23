
import { Skeleton } from "@/components/ui/skeleton";
import { AuthIllustration } from "@/components/shared/auth/AuthIllustration";

export default function AuthLoading() {
  return (
    <div className="auth-page flex min-h-screen">
      {/* Left Side - Form Skeleton */}
      <div className="auth-form-panel w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="auth-form-content w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-16 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="space-y-6">
            {/* Input fields */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div className="space-y-2">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Button */}
            <Skeleton className="h-12 w-full rounded-xl mt-6" />

            {/* Bottom link */}
            <div className="flex justify-center mt-4">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>

      <AuthIllustration title="Ada ruang untukmu di sini" description="Pelan-pelan saja. Setiap langkah kecil berarti." pose="welcome" />
    </div>
  );
}

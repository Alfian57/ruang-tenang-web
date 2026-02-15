
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form Skeleton */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
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

      {/* Right Side - Illustration Skeleton */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-red-600/80 via-rose-500/80 to-orange-400/80 animate-pulse">
        <div className="absolute inset-0 bg-white/10" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 h-full space-y-8">
           {/* Text placeholders */}
           <div className="space-y-4 w-full flex flex-col items-center">
              <div className="h-10 w-2/3 bg-white/20 rounded-lg backdrop-blur-sm" />
              <div className="h-4 w-1/2 bg-white/20 rounded backdrop-blur-sm" />
              <div className="h-4 w-2/3 bg-white/20 rounded backdrop-blur-sm" />
           </div>
           
           {/* Image placeholder */}
           <div className="w-64 h-80 bg-white/10 rounded-2xl backdrop-blur-sm mt-8" />
        </div>
      </div>
    </div>
  );
}

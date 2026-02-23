"use client";

import Signin from "@/components/Auth/Signin";
import { ThemeToggleSwitch } from "@/components/Layouts/header/theme-toggle";
import { Toaster } from "sonner";

/**
 * Sign-in UI only. Use inside a tree that already has ThemeProvider and UserProvider (e.g. RootProviders).
 * Used by App Router /auth/sign-in to avoid duplicate React (no Pages Router).
 */
export default function SignInPageContent() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] dark:opacity-20" />
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
          <ThemeToggleSwitch />
        </div>
        <div className="w-full max-w-6xl relative z-10">
          <div className="rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm shadow-2xl border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/20">
            <div className="flex flex-col lg:flex-row items-center min-h-[500px] sm:min-h-[600px]">
              <div className="w-full lg:w-1/2">
                <div className="w-full p-4 sm:p-6 lg:p-8 xl:p-12">
                  <Signin />
                </div>
              </div>
              <div className="hidden w-full p-6 sm:p-8 lg:block lg:w-1/2">
                <div className="relative overflow-hidden rounded-2xl h-full flex flex-col justify-center px-8 py-12 bg-blue-900">
                  <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-4">About Ressichem</h1>
                    <p className="text-white leading-relaxed mb-4">
                      Ressichem was established in 1999, since its inception over a decade ago, we are proud to cater to the needs of the construction and many other industries offering quality products manufactured at our state-of-the-art plant sourced from the best in the world. Raw materials for our products are also sourced from quality suppliers worldwide. Ressichem takes pride presenting a variety of construction materials and systems which can cater to many needs of the construction industry.
                    </p>
                    <p className="text-white leading-relaxed">
                      Backed by a fully equipped laboratory at our own premises with a team of qualified engineers and chemists. Ressichem carries our regular tests to maintain quality of finished products for various construction and industrial applications. Vigorous onsite support and quality systems allow for maintaining the quality of our products, as well as solve construction and industrial problems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}

import { LoggedInNavbar } from "@/components/loggedin-navbar";
import { LoggedInFooter } from "@/components/loggedin-footer";
import { ProtectedRoute } from "@/components/protected-route";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <LoggedInNavbar />
        <main className="flex-1 pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <LoggedInFooter />
      </div>
    </ProtectedRoute>
  );
}

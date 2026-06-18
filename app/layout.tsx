import "./globals.css";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";

export const metadata = {
  title: "TurboAgent",
  description: "AI Agent Interface",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-neutral-900 text-neutral-100 antialiased h-screen w-screen">
        <div className="flex h-full overflow-hidden">
          
          {/* Sidebar */}
          <aside className="w-64 h-full border-r border-neutral-800 bg-neutral-950 overflow-y-auto">
            <Sidebar />
          </aside>

          {/* Main content */}
          <main className="flex flex-col flex-1 h-full overflow-hidden">
            {/* Top bar */}
            <header className="h-14 border-b border-neutral-800 bg-neutral-900 flex-shrink-0">
              <StatusBar />
            </header>

            {/* Page content */}
            <section className="flex-1 overflow-y-auto p-4">
              {children}
            </section>
          </main>

        </div>
      </body>
    </html>
  );
}



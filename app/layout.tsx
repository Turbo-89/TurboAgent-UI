import "./globals.css";

export const metadata = {
  title: "TurboAgent UI",
  description: "AGI Marketing Agent Dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-neutral-900 text-white">
        {children}
      </body>
    </html>
  );
}

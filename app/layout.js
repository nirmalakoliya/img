import "./globals.css";

export const metadata = {
  title: "Nirmal Akoliya, Image Variator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

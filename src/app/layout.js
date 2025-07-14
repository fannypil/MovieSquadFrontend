import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "MovieSquad - Connect Through Movies",
  description: "A social platform for movie and TV show enthusiasts",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8b5cf6",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          {children}
        </div>
      </body>
    </html>
  );
}

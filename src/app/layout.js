import { Geist, Geist_Mono } from "next/font/google";
import { ReduxProvider } from "@/redux/Provider";
import { Header } from "./components/Header";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { LoaderProvider } from "@/context/LoaderContext";
import GlobalLoader from "./components/common/GlobalLoader";
import { InitToken } from "@/utils/InitToken";
import { AuthProvider } from "@/context/AuthProvider";
import Footer from "./components/Footer";
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shopi | Premier Online Fashion & Lifestyle Store",
  description: "Shop the latest in Men's and Women's fashion, seasonal trends, hoodies, denim, streetwear, and exclusive discount deals at Shopi.",
  keywords: ["fashion", "clothing", "ecommerce", "men fashion", "women fashion", "LIBAAS", "online shopping"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7"
          crossOrigin="anonymous"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq"
          crossOrigin="anonymous"
          defer
        ></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <InitToken />
          <AuthProvider>
            <LoaderProvider>
              <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <GlobalLoader />
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </LoaderProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

import { Analytics } from '@vercel/analytics/next';
import "./globals.css";
import "./normlize.css";
import ClientAppWrapper from "./ClientAppWrapper";
import TopPromo from "./components/PromotionBanner/PromotionBanner";

export const metadata = {
  title: "Trend Idleb | تريند ادلب فاشن",
  description: "مرحبًا بكم في Trend Idleb. اكتشفوا منتجاتنا وخدماتنا بسهولة.",
  openGraph: {
    title: "Trend Idleb",
    description: "مرحبًا بكم في Trend Idleb. اكتشفوا منتجاتنا وخدماتنا بسهولة.",
    url: "https://TrendIdleb.com", // Your main site URL
    images: ["../public/logo.svg"],
  },
};


export default function RootLayout({ children }) {
  return (
    <html >
      <head>
                <link rel="icon" href="/logo.svg" type="image/svg+xml" />

      </head>
      <body>
        <ClientAppWrapper>
            <div className="container">{children}</div>
<TopPromo/>
        </ClientAppWrapper>

        <Analytics/>
      </body>
    </html>
  );
}

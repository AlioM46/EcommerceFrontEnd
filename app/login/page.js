import Login from "../components/ClientComponents/Login";



export const metadata = {
  title: "تسجيل الدخول - Trend Idleb",
  description: "سجل دخولك الى الموقع بإمان.",
  openGraph: {
  title: "تسجيل الدخول - Trend Idleb",
  description: "سجل دخولك الى الموقع بإمان.",
    url: "https://example.com",
    images: ["/logo.svg"],
  },
};

export default function page () {
  return <Login/>
}
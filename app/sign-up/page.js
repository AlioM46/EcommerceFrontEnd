import Login from "../components/ClientComponents/Login";
import Signup from "../components/ClientComponents/SignUp";



export const metadata = {
  title: "إنشاء حساب جديد - Trend Idleb",
  description: "سجل دخولك الى الموقع بإمان.",
  openGraph: {
  title: "إنشاء حساب جديد - Trend Idleb",
  description: "سجل دخولك الى الموقع بإمان.",
    url: "https://TrendIdleb.com",
    images: ["/logo.svg"],
  },
};

export default function page () {
  return <Signup/>
}
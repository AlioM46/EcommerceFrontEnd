import Orders from '@/app/components/Orders/Orders.jsx'


export const metadata = {
  title: "طلباتي - Trend Idleb",
  description: "نصفح طلباتك ومشترياتك السابقة",
  openGraph: {
  title: "طلباتي - Trend Idleb",
  description: "نصفح طلباتك ومشترياتك السابقة",
    url: "https://TrendIdleb.com",
    images: ["/logo.svg"],
  },
};

const page = () => {
  return (
    <Orders/>

  )
}

export default page
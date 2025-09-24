
import "./OurPolicy.css";



export const metadata = {
  title: "سياسة المتجر - Trend Idleb",
  description: "تصفح أحدث المنتجات والعروض في الصفحة الرئيسية لموقعنا.",
  openGraph: {
    title: "الصفحة الرئيسية - Trend Idleb",
    description: "تصفح أحدث المنتجات والعروض في الصفحة الرئيسية لموقعنا.",
    url: "https://TrendIdleb.com",
    images: ["/logo.svg"],
  },
};
export default function StorePolicy() {
  return (
    <main className="policy-container">
      <div className="policy-box">
        {/* <h1 className="policy-title">سياسة متجر Trend Fashion Idleb</h1> */}
        <div className="divider"></div>

        <p className="policy-text">
          في <span className="highlight">Trend Fashion Idleb</span>، نحرص على أن تصلك منتجاتك بسرعة وأمان. يمكنك اختيار الشراء المباشر واستلام المنتج فوراً، أو الطلب بالتوصية ليصلك خلال أسبوعين تقريباً. جميع الطلبات مسبقة الدفع، ونضمن وصول المنتج كما طلبت بالضبط. إذا حدث أي خطأ من طرفنا، نتحمل المسؤولية كاملة ونرجع لك قيمة المنتج مع تعويض إضافي لضمان رضاك التام.
        </p>

        <p className="policy-text">
          نود التوضيح أنه لا يتم تبديل المنتجات أو إرجاعها إلا في حال وجود خطأ من طرفنا. وإذا رغبت، يمكننا مساعدتك بعرض المنتج على البيع المباشر ليستفيد منه عملاء آخرون.
        </p>

        <p className="policy-text">
          بالنسبة للطلبات بالتوصية، نقوم بتسليمها مجاناً داخل مدينة إدلب وبنش فقط، أما بقية المدن والمناطق فتتم عملية التوصيل عبر شركات شحن طرف ثالث، ويكون تكلفة الشحن على العميل، كما أننا لا نتحمل أي أخطاء تحدث من قبل شركة الشحن.
        </p>

        <p className="policy-text">
          فريقنا دائماً جاهز لمساعدتك والإجابة على أي استفسار، وبياناتك الشخصية محفوظة وآمنة بالكامل لتجربة تسوق مريحة وموثوقة.
        </p>

        <p className="policy-text highlight">
          معكم، كل طلبية هي قصة ثقة، وكل منتج هو وعد نوفي به 🦋
        </p>
      </div>
    </main>
  );
}

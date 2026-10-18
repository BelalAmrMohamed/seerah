export default function Footer() {
  return (
    <footer data-era="farewell" className="grid min-h-[70svh] place-items-center px-6 py-24 text-center">
      <div className="grid max-w-xl gap-6">
        <p className="font-display text-4xl leading-[1.7] md:text-6xl">انتهت الرحلة، وبقي الأثر</p>
        <p style={{ color: "var(--muted)", lineHeight: 2 }}>
          النصوص مأخوذة من كتاب «السيرة النبوية» لابن هشام، وروابط كل محطة تفتح صفحتها في{" "}
          <a className="underline underline-offset-4" href="https://shamela.ws/book/23833" target="_blank" rel="noopener noreferrer">المكتبة الشاملة</a>.
        </p>
        <a href="#top" className="btn mx-auto">العودة إلى البداية</a>
      </div>
    </footer>
  );
}

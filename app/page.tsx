import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold tracking-[0.3em] text-oak mb-2">SIEL</h1>
        <p className="text-textMuted text-sm tracking-widest uppercase">מערכת ניהול ספקים</p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        {/* Rabbi */}
        <Link href="/login?role=rabbi" className="flex-1 group">
          <div className="bg-white border border-beige rounded-2xl p-10 text-center hover:border-pink hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="w-16 h-16 bg-pink-pale rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✡</span>
            </div>
            <h2 className="text-xl font-semibold text-textMain mb-3">רב / מורה הוראה</h2>
            <p className="text-textMuted text-sm leading-relaxed">
              ניהול שאלות הלכה, צ׳אטים עם מתשואלות, וארכיון התכתבויות
            </p>
            <div className="mt-6 inline-block bg-oak text-white text-sm font-medium px-6 py-2.5 rounded-full group-hover:bg-textMain transition-colors">
              כניסה לרב
            </div>
          </div>
        </Link>

        {/* Beauty Pro */}
        <Link href="/login?role=beauty_pro" className="flex-1 group">
          <div className="bg-white border border-beige rounded-2xl p-10 text-center hover:border-pink hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="w-16 h-16 bg-pink-pale rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">💅</span>
            </div>
            <h2 className="text-xl font-semibold text-textMain mb-3">בעלת מקצוע</h2>
            <p className="text-textMuted text-sm leading-relaxed">
              ניהול לוח זמנים, אישור תורים, פורטפוליו ושיווק
            </p>
            <div className="mt-4 text-xs text-pink font-medium bg-pink-pale px-3 py-1 rounded-full inline-block mb-4">
              ₪100 / חודש
            </div>
            <div className="block bg-pink text-white text-sm font-medium px-6 py-2.5 rounded-full group-hover:bg-pink-deep transition-colors">
              כניסה לבעלת מקצוע
            </div>
          </div>
        </Link>
      </div>

      <p className="mt-12 text-textMuted text-xs">
        SIEL © {new Date().getFullYear()} · כל הזכויות שמורות
      </p>
    </main>
  )
}

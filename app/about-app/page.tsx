export default function AboutAppPage() {
  return (
    <main className="min-h-screen bg-cream py-12 px-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-[0.2em] text-oak mb-2">SIEL</h1>
          <p className="text-lg text-textMuted mt-2">האפליקציה לאישה שומרת מצוות</p>

          <div className="mt-6 bg-white border border-beige rounded-2xl p-8">
            <p className="text-base text-textMain leading-relaxed">
              SIEL היא אפליקציה שנבנתה במיוחד עבור נשים שומרות מצוות —
              מקום אחד לניהול המחזור, שאלות הלכתיות, תורים אצל מטפלות, ועוד.
            </p>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-xl font-bold text-oak mb-4 text-center">מה יש באפליקציה?</h2>
          <div className="space-y-4">

            <div className="bg-white border border-beige rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📅</span>
                <div>
                  <h3 className="font-bold text-textMain text-base mb-1">לוח שנה ומעקב מחזור</h3>
                  <p className="text-sm text-textMuted leading-relaxed">
                    מעקב אחר ימי הווסת, חישוב וסתות הלכתיות (הפלגה, חודש, עונה בינונית),
                    ספירת שבעה נקיים, וסימון ימי טבילה — הכול אוטומטי ומדויק.
                    הלוח מציג ימים בעברי ובלועזי לנוחיותך.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-beige rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🕍</span>
                <div>
                  <h3 className="font-bold text-textMain text-base mb-1">שאל את הרב</h3>
                  <p className="text-sm text-textMuted leading-relaxed">
                    שיחת צ'אט ישירה עם רב — לשאלות הלכתיות פרטיות ורגישות.
                    הרב מגיב בתוך זמן קצר, וכל השיחה נשמרת לעיון חוזר.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-beige rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">✨</span>
                <div>
                  <h3 className="font-bold text-textMain text-base mb-1">תורים אצל מטפלות יופי</h3>
                  <p className="text-sm text-textMuted leading-relaxed">
                    חיפוש מטפלות לפי עיר וקטגוריה (ציפורניים, גבות, הסרת שיער ועוד),
                    צפייה בתיק עבודות, ובחירת שירות ושעה — הכול בתוך האפליקציה.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-beige rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🔔</span>
                <div>
                  <h3 className="font-bold text-textMain text-base mb-1">התראות חכמות</h3>
                  <p className="text-sm text-textMuted leading-relaxed">
                    קבלי תזכורת לפני מועד הווסת הצפוי, אישור תור ממטפלת, ותגובה מרב —
                    כך שלא תפספסי דבר.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-xl font-bold text-oak mb-4 text-center">איך מתחילים?</h2>
          <div className="bg-white border border-beige rounded-2xl p-6">
            <ol className="space-y-4">
              {[
                { n: '1', text: 'מורידים את האפליקציה ונרשמים עם כתובת האימייל שלך' },
                { n: '2', text: 'מזינים את תאריך הווסת האחרון — האפליקציה תחשב את הכול אוטומטית' },
                { n: '3', text: 'מגלגלים בין הלשוניות: לוח שנה, שאל את הרב, שירותי יופי' },
                { n: '4', text: 'מזמינות תור, שולחות שאלה, או פשוט עוקבות אחר המחזור' },
              ].map(({ n, text }) => (
                <li key={n} className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-pink/10 text-pink font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                  <p className="text-sm text-textMuted leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Beta note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-amber-800 mb-1">האפליקציה בשלב בדיקות (Beta)</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            אנחנו בשלב גמר הפיתוח לפני השקה רשמית.
            אם קיבלת גישה לבדיקה — נשמח לשמוע מה עובד, מה פחות, ומה חסר.
            אפשר לשלוח משוב ל:
          </p>
          <a href="mailto:siel.app.contact@gmail.com" className="text-pink text-sm font-medium mt-2 inline-block hover:underline">
            siel.app.contact@gmail.com
          </a>
        </div>

        <p className="text-center text-xs text-textMuted">
          SIEL © {new Date().getFullYear()} · כל הזכויות שמורות
        </p>
      </div>
    </main>
  )
}

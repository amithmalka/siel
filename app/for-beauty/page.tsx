import Link from 'next/link'

export default function ForBeautyPage() {
  return (
    <main className="min-h-screen bg-cream" dir="rtl">

      {/* Hero */}
      <div className="bg-gradient-to-br from-pink/10 via-cream to-white border-b border-beige">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-pink/10 text-pink text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            💅 פלטפורמת SIEL לבעלות מקצוע
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-textMain leading-tight mb-5">
            לקוחות חדשות מגיעות<br />
            <span className="text-pink">אוטומטית.</span> בלי מאמץ.
          </h1>
          <p className="text-textMuted text-lg leading-relaxed max-w-xl mx-auto mb-8">
            SIEL מחברת נשים שמחפשות שירותי יופי לבעלות מקצוע מוסמכות — ישירות דרך האפליקציה. אתן מגדירות מחירים ושעות, המערכת עושה את השאר.
          </p>
          <Link
            href="/login?role=beauty_pro"
            className="inline-block bg-pink text-white font-semibold px-8 py-3.5 rounded-full text-sm hover:opacity-90 transition-opacity shadow-sm"
          >
            הצטרפי עכשיו — חינם לחודש ראשון
          </Link>
        </div>
      </div>

      {/* Why SIEL */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-textMain text-center mb-10">למה בעלות מקצוע בוחרות ב-SIEL?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: '📲',
              title: 'לקוחות מגיעות אלייך',
              desc: 'נשים מחפשות שירותים לפי קטגוריה ועיר — הפרופיל שלך מופיע בתוצאות ומביא לקוחות ישירות',
            },
            {
              icon: '🗓',
              title: 'ניהול תורים בלחיצה',
              desc: 'תורים מגיעים לדאשבורד, את מאשרת בלחיצה אחת. הלקוחה מקבלת הודעה מיידית לנייד',
            },
            {
              icon: '⚡',
              title: 'מי שמאשרת ראשונה — מקבלת',
              desc: 'לקוחות שולחות בקשה לכמה בעלות מקצוע. מי שמגיבה מהר — סוגרת את התור',
            },
            {
              icon: '🔒',
              title: 'ללא כפילויות',
              desc: 'ברגע שאישרת תור — שאר הבקשות לאותו שירות מתבטלות אוטומטית. לא צריך לעשות כלום',
            },
            {
              icon: '💼',
              title: 'פרופיל מקצועי',
              desc: 'גלריית תמונות, ביו, מחירון שירותים — הכל בפרופיל אחד שמרשים לקוחות חדשות',
            },
            {
              icon: '₪',
              title: '₪100 בלבד לחודש',
              desc: 'ללא עמלות על תורים, ללא הפתעות. מחיר קבוע פשוט. החודש הראשון חינם',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-beige rounded-2xl p-5">
              <span className="text-2xl mb-3 block">{item.icon}</span>
              <p className="text-sm font-semibold text-textMain mb-1.5">{item.title}</p>
              <p className="text-xs text-textMuted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white border-y border-beige">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold text-textMain text-center mb-2">איך זה עובד?</h2>
          <p className="text-textMuted text-sm text-center mb-10">מהרשמה ועד לקוחה ראשונה — 5 דקות</p>

          <div className="space-y-6">
            {[
              {
                num: '1',
                title: 'יוצרים פרופיל',
                desc: 'נרשמת, ממלאת שם עסק, קטגוריה (ציפורניים / שיער / איפור / וכו.), עיר, מחירון שירותים ותמונות עבודה. זהו.',
              },
              {
                num: '2',
                title: 'מגדירים שעות זמינות',
                desc: 'בוחרת אילו ימים ושעות את עובדת — המערכת מציגה ללקוחות רק שעות פנויות.',
              },
              {
                num: '3',
                title: 'לקוחה מוצאת אותך',
                desc: 'נשים שמחפשות שירות כמו שלך בעירך רואות את הפרופיל שלך ושולחות בקשת תור.',
              },
              {
                num: '4',
                title: 'את מאשרת בלחיצה אחת',
                desc: 'בדאשבורד מופיעה הבקשה — לחיצה על ״אשרי תור״ ומיד נשלחת הודעה ללקוחה עם האישור.',
              },
              {
                num: '5',
                title: 'הלקוחה מגיעה אלייך',
                desc: 'שתיכן מקבלות תזכורת לפני התור. אחרי שהתור הסתיים, הלקוחה יכולה לשים ביקורת בפרופיל שלך.',
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-pink/15 text-pink flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <p className="text-sm font-semibold text-textMain mb-1">{step.title}</p>
                  <p className="text-xs text-textMuted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What you need */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-textMain text-center mb-2">מה צריך כדי להתחיל?</h2>
        <p className="text-textMuted text-sm text-center mb-8">לפני שהפרופיל שלך מופיע ללקוחות, יש למלא 3 דברים:</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: '🖼',
              title: 'תמונות עבודה',
              desc: 'לפחות תמונה אחת מהעבודות שלך — לקוחות אוהבות לראות את הסגנון לפני שהן מזמינות',
            },
            {
              icon: '🕐',
              title: 'שעות זמינות',
              desc: 'הגדירי באילו ימים ושעות את עובדת כדי שהמערכת תציע תורים ריאליים',
            },
            {
              icon: '✍️',
              title: 'ביו קצרה',
              desc: 'כמה מילים עלייך ועל הניסיון שלך — זה מה שגורם ללקוחה לבחור דווקא בך',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-beige rounded-2xl p-5 text-center">
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <p className="text-sm font-semibold text-textMain mb-1.5">{item.title}</p>
              <p className="text-xs text-textMuted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-sm text-amber-800 text-center">
          הפרופיל שלך <strong>לא יופיע בחיפוש</strong> עד שכל השדות האלה ימולאו — כדי להבטיח חוויה מקצועית ללקוחות.
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-pink/10 to-white border-t border-beige">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-textMain mb-3">מוכנה להתחיל לקבל לקוחות?</h2>
          <p className="text-textMuted text-sm mb-8 max-w-md mx-auto">
            ההצטרפות לוקחת 5 דקות. החודש הראשון חינם לחלוטין — בלי צורך בכרטיס אשראי.
          </p>
          <Link
            href="/login?role=beauty_pro"
            className="inline-block bg-pink text-white font-semibold px-8 py-3.5 rounded-full text-sm hover:opacity-90 transition-opacity shadow-sm"
          >
            הצטרפי עכשיו
          </Link>
          <p className="mt-4 text-xs text-textMuted">
            ₪100 לחודש אחרי החודש הראשון · ללא עמלות · ביטול בכל עת
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-beige text-center py-6">
        <Link href="/" className="text-xs text-textMuted hover:text-pink transition-colors">
          ← חזרה לדף הכניסה
        </Link>
        <p className="mt-2 text-xs text-textMuted">SIEL © {new Date().getFullYear()}</p>
      </div>

    </main>
  )
}

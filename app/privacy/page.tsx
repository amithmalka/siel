export default function PrivacyPolicy() {
  const lastUpdated = '19 באפריל 2026'

  return (
    <main className="min-h-screen bg-cream py-12 px-6" dir="rtl">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-[0.2em] text-oak mb-2">SIEL</h1>
          <h2 className="text-xl font-semibold text-textMain mt-4">מדיניות פרטיות</h2>
          <p className="text-xs text-textMuted mt-2">עודכן לאחרונה: {lastUpdated}</p>
        </div>

        <div className="bg-white border border-beige rounded-2xl p-8 space-y-8 text-sm leading-relaxed text-textMain">

          <section>
            <h3 className="font-bold text-base mb-3">1. מבוא</h3>
            <p className="text-textMuted">
              אפליקציית SIEL ("האפליקציה", "השירות") מופעלת על ידי צוות SIEL. אנו מחויבים להגן על פרטיותך.
              מדיניות זו מסבירה אילו מידע אנו אוספים, כיצד אנו משתמשים בו, ומהן זכויותייך.
              השימוש באפליקציה מהווה הסכמה למדיניות זו.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">2. המידע שאנו אוספים</h3>
            <ul className="text-textMuted space-y-2 list-none">
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">פרטי חשבון:</strong> כתובת אימייל וסיסמה בעת ההרשמה.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">פרטים אישיים:</strong> שם, מספר טלפון, עיר מגורים — שנמסרים מרצון בעת שימוש בשירות.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">תורים ושאלות:</strong> בקשות לתורים, שאלות הלכתיות, והיסטוריית השיחות.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">טוקן התראות:</strong> מזהה ייחודי לשליחת התראות Push לנייד שלך (אם אישרת קבלת התראות).</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">נתוני שימוש:</strong> מידע טכני כגון סוג המכשיר וגרסת האפליקציה.</span></li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">3. כיצד אנו משתמשים במידע</h3>
            <ul className="text-textMuted space-y-2 list-none">
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span>מתן השירות — חיבור בין לקוחות לבעלות מקצוע ולרבנים.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span>שליחת אישורי תורים והתראות רלוונטיות.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span>שיפור השירות ואיתור תקלות טכניות.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span>אנו <strong className="text-textMain">לא</strong> מוכרים, משכירים, או מעבירים את פרטייך לצדדים שלישיים לצורכי פרסום.</span></li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">4. אחסון המידע</h3>
            <p className="text-textMuted">
              המידע מאוחסן בשרתי Supabase (איחוד אירופי / ארה"ב) בהתאם לתקן אבטחה גבוה.
              אנו נוקטים אמצעים טכניים ואירגוניים להגנה על המידע מפני גישה, שינוי, חשיפה, או מחיקה בלתי מורשית.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">5. התראות Push</h3>
            <p className="text-textMuted">
              האפליקציה עשויה לשלוח התראות לגבי אישורי תורים ועדכונים. תוכלי לבטל את ההרשאה בכל עת
              דרך הגדרות המכשיר שלך.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">6. שיתוף מידע עם צדדים שלישיים</h3>
            <p className="text-textMuted">
              אנו עשויים לשתף מידע עם ספקי שירות הפועלים מטעמנו בלבד (כגון Supabase לאחסון נתונים ו-Expo לשליחת התראות),
              אשר מחויבים לשמור על סודיות המידע. לא מתבצע שיתוף מידע לכל מטרה אחרת.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">7. זכויותייך</h3>
            <ul className="text-textMuted space-y-2 list-none">
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">עיון:</strong> זכות לקבל עותק של המידע השמור עלייך.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">תיקון:</strong> זכות לבקש תיקון מידע שגוי.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">מחיקה:</strong> זכות למחוק את חשבונך וכל המידע הקשור בו.</span></li>
              <li className="flex gap-2"><span className="text-pink flex-shrink-0">•</span><span><strong className="text-textMain">ביטול הסכמה:</strong> זכות לבטל את הסכמתך לשימוש במידע בכל עת.</span></li>
            </ul>
            <p className="text-textMuted mt-3">
              למימוש זכויותייך, ניתן למחוק את החשבון ישירות מהאפליקציה, או לפנות אלינו בדוא"ל.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">8. קטינים</h3>
            <p className="text-textMuted">
              השירות אינו מיועד לילדים מתחת לגיל 13. אנו לא אוספים ביודעין מידע מקטינים.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">9. שינויים במדיניות</h3>
            <p className="text-textMuted">
              אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באפליקציה. המשך השימוש לאחר פרסום
              השינוי מהווה הסכמה למדיניות המעודכנת.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-3">10. יצירת קשר</h3>
            <p className="text-textMuted">
              לכל שאלה בנוגע למדיניות פרטיות זו, ניתן לפנות אלינו:
            </p>
            <p className="mt-2 text-textMain font-medium">siel.app.contact@gmail.com</p>
          </section>

        </div>

        <p className="text-center text-xs text-textMuted mt-8">
          SIEL © {new Date().getFullYear()} · כל הזכויות שמורות
        </p>
      </div>
    </main>
  )
}

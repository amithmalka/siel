import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-textMain mb-3">אין גישה</h1>
        <p className="text-textMuted mb-6">אין לך הרשאות לדף זה.</p>
        <Link href="/" className="bg-pink text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90">
          חזרה לדף הבית
        </Link>
      </div>
    </main>
  )
}

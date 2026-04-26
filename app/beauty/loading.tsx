export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" dir="rtl">
      <div className="h-8 w-48 bg-beige rounded-xl" />
      <div className="h-4 w-32 bg-beige rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-beige rounded-2xl p-6">
            <div className="h-3 w-24 bg-beige rounded mb-3" />
            <div className="h-10 w-12 bg-beige rounded" />
          </div>
        ))}
      </div>
      <div className="max-w-2xl bg-white border border-beige rounded-2xl p-6 space-y-4">
        <div className="h-4 w-40 bg-beige rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-beige flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-beige rounded" />
              <div className="h-3 w-full bg-beige rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" dir="rtl">
      <div className="h-8 w-48 bg-beige rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-beige rounded-2xl p-6">
            <div className="h-3 w-24 bg-beige rounded mb-3" />
            <div className="h-10 w-12 bg-beige rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" dir="rtl">
      <div className="h-8 w-36 bg-beige rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-beige rounded-2xl p-5">
            <div className="flex justify-between mb-2">
              <div className="h-4 w-28 bg-beige rounded" />
              <div className="h-3 w-16 bg-beige rounded" />
            </div>
            <div className="h-3 w-3/4 bg-beige rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

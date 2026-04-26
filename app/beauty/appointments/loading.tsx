export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" dir="rtl">
      <div className="h-8 w-40 bg-beige rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-beige rounded-2xl p-5 flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-beige rounded" />
              <div className="h-3 w-24 bg-beige rounded" />
              <div className="h-3 w-20 bg-beige rounded" />
            </div>
            <div className="h-9 w-20 bg-beige rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

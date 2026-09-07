export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed">
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
    </div>
  )
}

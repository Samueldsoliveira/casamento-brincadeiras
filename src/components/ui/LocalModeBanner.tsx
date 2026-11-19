export function LocalModeBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 text-center">
      <p className="font-body text-amber-800 text-sm font-semibold">
        ⚠️ Modo local — sem Supabase configurado
      </p>
      <p className="font-body text-amber-700 text-xs mt-0.5">
        Os dados não são salvos. Configure o <code className="bg-amber-100 px-1 rounded">.env</code> para usar o app de verdade.
      </p>
    </div>
  )
}

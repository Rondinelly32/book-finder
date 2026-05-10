export default function StepLoading() {
  return (
    <div className="text-center py-20">
      <div className="inline-block w-5 h-5 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin mb-4" />
      <p className="text-sm text-stone-400">Buscando livros para você...</p>
    </div>
  );
}

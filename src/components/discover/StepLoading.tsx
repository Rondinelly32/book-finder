export default function StepLoading() {
  return (
    <div className="text-center py-16">
      <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-sm">Buscando livros para você...</p>
    </div>
  );
}

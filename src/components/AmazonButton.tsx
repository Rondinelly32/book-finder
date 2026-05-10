interface Props {
  title: string;
  author: string;
  affiliateUrl: string;
}

export default function AmazonButton({ affiliateUrl }: Props) {
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
    >
      Comprar na Amazon
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </a>
  );
}

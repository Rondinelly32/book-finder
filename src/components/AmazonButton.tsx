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
      className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#e68900] text-black font-semibold px-4 py-2 rounded-md transition-colors text-sm"
    >
      🛒 Comprar na Amazon Brasil
    </a>
  );
}

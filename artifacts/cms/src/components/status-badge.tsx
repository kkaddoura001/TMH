const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  in_review: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  approved: "bg-green-500/15 text-green-400 border-green-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  revision: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  flagged: "bg-red-500/15 text-red-400 border-red-500/20",
  archived: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Live",
  rejected: "Rejected",
  revision: "Revision",
  flagged: "Flagged",
  archived: "Archived",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] || "bg-gray-500/15 text-gray-400 border-gray-500/20"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

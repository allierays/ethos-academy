import { ALIGNMENT_STYLES } from "../../lib/colors";

interface AlignmentBadgeProps {
  status: string;
  className?: string;
}

export default function AlignmentBadge({ status, className = "" }: AlignmentBadgeProps) {
  const colorClass = ALIGNMENT_STYLES[status] || "bg-muted/10 text-muted";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${colorClass} ${className}`}
    >
      {status}
    </span>
  );
}

interface StatusBadgeProps {
    value: string;
}

const toneMap: Record<string, string> = {
    Active: "good",
    "At Risk": "warn",
    "On Intervention": "danger",
    Completed: "neutral",
    Approved: "good",
    Submitted: "warn",
    Rejected: "danger",
};

export function StatusBadge({ value }: StatusBadgeProps) {
    const tone = toneMap[value] ?? "neutral";
    return <span className={`status status-${tone}`}>{value}</span>;
}

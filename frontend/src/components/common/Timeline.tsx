export interface TimelineItem {
    id: string;
    title: string;
    meta: string;
    detail: string;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
    return (
        <section className="panel">
            <h3>Recent Activity</h3>
            <ol className="timeline">
                {items.map((item) => (
                    <li key={item.id}>
                        <div className="timeline-dot" />
                        <div>
                            <h4>{item.title}</h4>
                            <p className="timeline-meta">{item.meta}</p>
                            <p>{item.detail}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}

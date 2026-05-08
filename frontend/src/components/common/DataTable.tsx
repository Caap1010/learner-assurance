import { StatusBadge } from "./StatusBadge";

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
    title: string;
    columns: Column<T>[];
    rows: T[];
}

export function DataTable<T extends Record<string, unknown>>({ title, columns, rows }: DataTableProps<T>) {
    return (
        <section className="panel">
            <div className="panel-head">
                <h3>{title}</h3>
                <span>{rows.length} rows</span>
            </div>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={String(col.key)}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                {columns.map((col) => {
                                    const value = row[col.key];
                                    if (col.render) {
                                        return <td key={String(col.key)}>{col.render(value, row)}</td>;
                                    }
                                    if (typeof value === "string" && ["Active", "At Risk", "On Intervention", "Completed", "Approved", "Submitted", "Rejected"].includes(value)) {
                                        return (
                                            <td key={String(col.key)}>
                                                <StatusBadge value={value} />
                                            </td>
                                        );
                                    }
                                    return <td key={String(col.key)}>{String(value)}</td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

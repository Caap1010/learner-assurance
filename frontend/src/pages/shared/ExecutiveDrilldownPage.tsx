import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { COMPLIANCE_TREND, INTERVENTIONS, LEARNERS, REVIEWS } from '../../data/mockData';

type DrilldownView = 'learners' | 'completion' | 'compliance' | 'risk';

const PAGE_META: Record<DrilldownView, { title: string; eyebrow: string }> = {
  learners: { title: 'Learner Breakdown', eyebrow: 'Executive Drilldown' },
  completion: { title: 'Completion Drilldown', eyebrow: 'Executive Drilldown' },
  compliance: { title: 'Compliance Drilldown', eyebrow: 'Executive Drilldown' },
  risk: { title: 'Risk Drilldown', eyebrow: 'Executive Drilldown' },
};

export default function ExecutiveDrilldownPage({ view }: { view: DrilldownView }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const monthFilter = searchParams.get('month');
  const riskFilter = searchParams.get('risk');

  const monthMap: Record<string, string> = {
    jan: 'january',
    feb: 'february',
    mar: 'march',
    apr: 'april',
    may: 'may',
    jun: 'june',
    jul: 'july',
    aug: 'august',
    sep: 'september',
    oct: 'october',
    nov: 'november',
    dec: 'december',
  };

  const learnerRows = useMemo(
    () => LEARNERS.filter((row) => (statusFilter ? row.status === statusFilter : true)),
    [statusFilter],
  );

  const completionRows = useMemo(
    () => REVIEWS.filter((row) => {
      if (!monthFilter) return true;
      const mf = monthFilter.toLowerCase();
      const normalizedFilter = monthMap[mf] ?? mf;
      return row.period.toLowerCase().includes(normalizedFilter) || row.period.toLowerCase().includes(mf);
    }),
    [monthFilter],
  );

  const complianceRows = useMemo(
    () => COMPLIANCE_TREND.filter((row) => (monthFilter ? row.month.toLowerCase() === monthFilter.toLowerCase() : true)),
    [monthFilter],
  );

  const riskRows = useMemo(
    () => INTERVENTIONS.filter((row) => (riskFilter ? row.riskLevel === riskFilter : true)),
    [riskFilter],
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">{PAGE_META[view].eyebrow}</p>
          <h1 className="page-title">{PAGE_META[view].title}</h1>
          {(statusFilter || monthFilter || riskFilter) && (
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
              Active filter: {statusFilter ?? monthFilter ?? riskFilter}
            </p>
          )}
        </div>
        <button className="secondary-button" onClick={() => navigate(-1)}>Back to Report</button>
      </div>

      {view === 'learners' && (
        <div className="card">
          <DataTable
            columns={[
              { key: 'name', label: 'Learner' },
              { key: 'programme', label: 'Programme' },
              { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
              { key: 'attendance', label: 'Attendance', render: row => `${row.attendance}%` },
              { key: 'employer', label: 'Employer' },
            ]}
            data={learnerRows}
            keyField="id"
            exportFilename="executive-learners"
          />
        </div>
      )}

      {view === 'completion' && (
        <div className="card">
          <DataTable
            columns={[
              { key: 'learnerName', label: 'Learner' },
              { key: 'period', label: 'Period' },
              { key: 'score', label: 'Score' },
              { key: 'comments', label: 'Summary' },
            ]}
            data={completionRows}
            keyField="id"
            exportFilename="executive-completion"
          />
        </div>
      )}

      {view === 'compliance' && (
        <div className="card">
          <DataTable
            columns={[
              { key: 'month', label: 'Month' },
              { key: 'compliance', label: 'Compliance %' },
              { key: 'status', label: 'Status', render: row => <StatusBadge status={row.compliance >= 95 ? 'on-track' : row.compliance >= 90 ? 'at-risk' : 'escalated'} /> },
            ]}
            data={complianceRows}
            keyField="month"
            exportFilename="executive-compliance"
          />
        </div>
      )}

      {view === 'risk' && (
        <div className="card">
          <DataTable
            columns={[
              { key: 'learnerName', label: 'Learner' },
              { key: 'riskLevel', label: 'Risk', render: row => <StatusBadge status={row.riskLevel} /> },
              { key: 'status', label: 'Case Status', render: row => <StatusBadge status={row.status} /> },
              { key: 'assignedTo', label: 'Owner' },
              { key: 'daysOpen', label: 'Days Open' },
            ]}
            data={riskRows}
            keyField="id"
            exportFilename="executive-risk"
          />
        </div>
      )}
    </div>
  );
}

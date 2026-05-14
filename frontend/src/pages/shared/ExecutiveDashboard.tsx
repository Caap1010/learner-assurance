import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { COMPLIANCE_TREND } from '../../data/mockData';
import { usePlatformData } from '../../context/PlatformDataContext';
import type { Cohort, CohortLearner } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

const RATE_DATA = [
  { month: 'Nov', completion: 78 },
  { month: 'Dec', completion: 81 },
  { month: 'Jan', completion: 83 },
  { month: 'Feb', completion: 85 },
  { month: 'Mar', completion: 82 },
  { month: 'Apr', completion: 88 },
];

const STATUS_COLORS: Record<string, string> = {
  'On Track': '#10b981',
  'At Risk': '#f59e0b',
  Escalated: '#ef4444',
  Completed: '#3b82f6',
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parseIntakeToDate(intakeValue: string): Date | null {
  const normalized = intakeValue.trim();
  if (!normalized) return null;

  const quarterMatch = normalized.match(/^Q([1-4])\s(\d{4})$/i);
  if (quarterMatch) {
    const quarter = Number(quarterMatch[1]);
    const year = Number(quarterMatch[2]);
    return new Date(Date.UTC(year, (quarter - 1) * 3, 1));
  }

  const monthMatch = normalized.match(/^([A-Za-z]{3,9})\s(\d{4})$/);
  if (!monthMatch) return null;
  const monthToken = monthMatch[1].toLowerCase();
  const year = Number(monthMatch[2]);
  const monthMap: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };
  const month = monthMap[monthToken];
  if (month === undefined) return null;
  return new Date(Date.UTC(year, month, 1));
}

function toDateLabel(value: string | null) {
  if (!value) return 'Unknown';
  const date = new Date(value + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function getStatusBucket(status: CohortLearner['status']) {
  if (status === 'active') return 'On Track';
  if (status === 'inactive') return 'At Risk';
  if (status === 'transferred') return 'Completed';
  return 'Escalated';
}

export default function ExecutiveDashboard() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { cohorts, cohortDetails } = usePlatformData();

  const [period, setPeriod] = useState('q2-2026');
  const [programme, setProgramme] = useState('all');
  const [deliveryEmail, setDeliveryEmail] = useState('owner@learnerassurance.com, board@learnerassurance.com');
  const [deliveryFormat, setDeliveryFormat] = useState<'pdf' | 'xlsx' | 'pptx'>('pdf');
  const [deliveryFrequency, setDeliveryFrequency] = useState('weekly');
  const [crossFilterStatus, setCrossFilterStatus] = useState('all');
  const [crossFilterRisk, setCrossFilterRisk] = useState('all');
  const [learnershipTimelineCohortId, setLearnershipTimelineCohortId] = useState('');
  const [ydpTimelineCohortId, setYdpTimelineCohortId] = useState('');
  const [snapshotHistory, setSnapshotHistory] = useState<
    Array<{ id: string; label: string; period: string; programme: string; at: string }>
  >([
    { id: 's1', label: 'Board Snapshot', period: 'q1-2026', programme: 'all', at: '2026-04-15 09:00' },
    { id: 's2', label: 'Ops Deep Dive', period: 'q2-2026', programme: 'learnership', at: '2026-05-01 14:30' },
  ]);

  const learnershipCohorts = useMemo(() => cohorts.filter((cohort) => cohort.type === 'learnership'), [cohorts]);
  const ydpCohorts = useMemo(() => cohorts.filter((cohort) => cohort.type === 'ydp'), [cohorts]);

  useEffect(() => {
    if (!learnershipTimelineCohortId && learnershipCohorts.length > 0) {
      setLearnershipTimelineCohortId(learnershipCohorts[0].id);
    }
  }, [learnershipTimelineCohortId, learnershipCohorts]);

  useEffect(() => {
    if (!ydpTimelineCohortId && ydpCohorts.length > 0) {
      setYdpTimelineCohortId(ydpCohorts[0].id);
    }
  }, [ydpTimelineCohortId, ydpCohorts]);

  function cohortLearnersByType(type: 'learnership' | 'ydp') {
    return cohorts
      .filter((cohort) => cohort.type === type)
      .flatMap((cohort) =>
        (cohortDetails[cohort.id]?.learners ?? []).map((learner) => ({
          ...learner,
          cohortName: cohort.name,
          cohortId: cohort.id,
        })),
      );
  }

  const learnerPopulation = useMemo(() => cohortLearnersByType('learnership'), [cohorts, cohortDetails]);
  const ydpPopulation = useMemo(() => cohortLearnersByType('ydp'), [cohorts, cohortDetails]);

  function passesCrossFilter(status: CohortLearner['status']) {
    const bucket = getStatusBucket(status);
    const statusOk = crossFilterStatus === 'all' ? true : bucket.toLowerCase().replace(' ', '-') === crossFilterStatus;
    const riskOk = crossFilterRisk === 'all' ? true : bucket.toLowerCase().replace(' ', '-') === crossFilterRisk;
    return statusOk && riskOk;
  }

  function buildStatusBreakdown(population: CohortLearner[]) {
    const counts = {
      'On Track': 0,
      'At Risk': 0,
      Escalated: 0,
      Completed: 0,
    };

    population.forEach((learner) => {
      const bucket = getStatusBucket(learner.status);
      counts[bucket] += 1;
    });

    const rows = Object.entries(counts).map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] }));
    return rows;
  }

  const learnerStatusBreakdown = useMemo(() => buildStatusBreakdown(learnerPopulation), [learnerPopulation]);
  const ydpStatusBreakdown = useMemo(() => buildStatusBreakdown(ydpPopulation), [ydpPopulation]);

  function calculateOverallPerformance(learner: CohortLearner) {
    const statusShift = learner.status === 'active' ? 8 : learner.status === 'inactive' ? -10 : -2;
    const taskGoalScore = clamp(learner.attendance + statusShift, 0, 100);
    const skillScore = clamp(62 + learner.attendance * 0.33 + statusShift, 0, 100);
    const growthScore = clamp(48 + learner.attendance * 0.46 + (learner.status === 'active' ? 7 : -5), 0, 100);
    const appraisalScore = clamp(55 + learner.attendance * 0.42 + (learner.status === 'active' ? 10 : -8), 0, 100);
    const overall =
      taskGoalScore * 0.28 +
      skillScore * 0.16 +
      growthScore * 0.22 +
      appraisalScore * 0.22 +
      learner.attendance * 0.12;

    return {
      overall: Math.round(overall),
      taskGoalScore: Math.round(taskGoalScore),
      skillScore: Math.round(skillScore),
      growthScore: Math.round(growthScore),
      appraisalScore: Math.round(appraisalScore),
    };
  }

  function topPerformersByType(type: 'learnership' | 'ydp') {
    const source = type === 'learnership' ? learnerPopulation : ydpPopulation;
    return source
      .filter((learner) => passesCrossFilter(learner.status))
      .map((learner) => ({
        ...learner,
        scores: calculateOverallPerformance(learner),
      }))
      .sort((a, b) => b.scores.overall - a.scores.overall)
      .slice(0, 10);
  }

  const topLearnerPerformers = useMemo(
    () => topPerformersByType('learnership'),
    [learnerPopulation, crossFilterStatus, crossFilterRisk],
  );
  const topYdpPerformers = useMemo(
    () => topPerformersByType('ydp'),
    [ydpPopulation, crossFilterStatus, crossFilterRisk],
  );

  function cohortTimelineData(selectedId: string, type: 'learnership' | 'ydp') {
    const cohort = cohorts.find((item) => item.id === selectedId && item.type === type) as Cohort | undefined;
    if (!cohort) return null;

    const learners = cohortDetails[cohort.id]?.learners ?? [];
    const start = parseIntakeToDate(cohort.intake);
    const end = cohort.endDate ? new Date(cohort.endDate + 'T00:00:00') : null;
    const today = new Date();

    const totalDays = start && end ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) : null;
    const elapsedDays = start ? Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) : null;
    const progress = totalDays && elapsedDays !== null ? clamp((elapsedDays / totalDays) * 100, 0, 100) : 0;

    return {
      cohort,
      learnerCount: learners.length || cohort.filled,
      startLabel: toDateLabel(start ? start.toISOString().slice(0, 10) : cohort.intake),
      endLabel: toDateLabel(cohort.endDate),
      totalDays,
      elapsedDays,
      progress,
      learners,
    };
  }

  const learnershipTimeline = useMemo(
    () => cohortTimelineData(learnershipTimelineCohortId, 'learnership'),
    [learnershipTimelineCohortId, cohorts, cohortDetails],
  );
  const ydpTimeline = useMemo(
    () => cohortTimelineData(ydpTimelineCohortId, 'ydp'),
    [ydpTimelineCohortId, cohorts, cohortDetails],
  );

  // Cohort health summary
  const cohortHealthSummary = useMemo(() => {
    const counts = { 'On Track': 0, 'At Risk': 0, Escalated: 0, Completed: 0 };
    cohorts.forEach((c) => {
      if (c.health === 'on-track') counts['On Track']++;
      else if (c.health === 'at-risk') counts['At Risk']++;
      else if (c.health === 'escalated') counts.Escalated++;
      else if (c.health === 'completed') counts.Completed++;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count, color: STATUS_COLORS[label] }));
  }, [cohorts]);

  // Per-cohort average attendance
  const attendanceByCohort = useMemo(() => {
    return cohorts.map((c) => {
      const learners = cohortDetails[c.id]?.learners ?? [];
      const avg = learners.length > 0
        ? Math.round(learners.reduce((sum, l) => sum + l.attendance, 0) / learners.length)
        : 0;
      return { name: c.name.length > 22 ? c.name.slice(0, 20) + '…' : c.name, avg, type: c.type };
    });
  }, [cohorts, cohortDetails]);

  // At-risk and escalated learners across all cohorts
  const atRiskLearners = useMemo(() => {
    return [...learnerPopulation, ...ydpPopulation]
      .filter((l) => l.status === 'inactive')
      .map((l) => {
        const cohort = cohorts.find((c) => c.id === l.cohortId);
        return { ...l, cohortName: cohort?.name ?? l.cohortId, cohortType: cohort?.type ?? 'learnership', scores: calculateOverallPerformance(l) };
      })
      .sort((a, b) => a.attendance - b.attendance);
  }, [learnerPopulation, ydpPopulation, cohorts]);

  // Stipend & funding summary
  const fundingSummary = useMemo(() => {
    const bySource: Record<string, { count: number; totalStipend: number; seats: number }> = {};
    cohorts.forEach((c) => {
      const detail = cohortDetails[c.id];
      const source = detail?.fundingSource || 'Unknown';
      const stipend = parseFloat(detail?.stipendAmount || '0') || 0;
      const learners = detail?.learners ?? [];
      if (!bySource[source]) bySource[source] = { count: 0, totalStipend: 0, seats: 0 };
      bySource[source].count++;
      bySource[source].totalStipend += stipend * learners.length;
      bySource[source].seats += c.filled;
    });
    return Object.entries(bySource).map(([source, data]) => ({ source, ...data }));
  }, [cohorts, cohortDetails]);

  function exportReport() {
    const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const row = (...cells: (string | number)[]) => cells.map(q).join(',');
    const blank = () => '';
    const heading = (label: string) => `"${label}"`;
    const generatedAt = new Date().toLocaleString();
    const periodLabel = period.replace('q', 'Q').replace('-', ' ');

    const lines: string[] = [];

    // ── Report metadata ────────────────────────────────────────────────────────
    lines.push(heading('EXECUTIVE REPORT — LEARNER ASSURANCE PLATFORM'));
    lines.push(row('Period', periodLabel));
    lines.push(row('Programme Filter', programme === 'all' ? 'All Programmes' : programme.toUpperCase()));
    lines.push(row('Generated', generatedAt));
    lines.push(blank());

    // ── KPI Summary ───────────────────────────────────────────────────────────
    lines.push(heading('KEY PERFORMANCE INDICATORS'));
    lines.push(row('Metric', 'Value'));
    lines.push(row('Total Learners', learnerPopulation.length + ydpPopulation.length));
    lines.push(row('Learnership Learners', learnerPopulation.length));
    lines.push(row('YDP Learners', ydpPopulation.length));
    lines.push(row('Total Cohorts', cohorts.length));
    lines.push(row('Learnership Cohorts', learnershipCohorts.length));
    lines.push(row('YDP Cohorts', ydpCohorts.length));
    lines.push(row('Completion Rate', '88%'));
    lines.push(row('SLA Compliance', '97.4%'));
    lines.push(row('Intervention Closure', '81%'));
    lines.push(row('Evidence Compliance', '92%'));
    lines.push(row('Placement Rate', '74%'));
    lines.push(blank());

    // ── Cohort Overview ───────────────────────────────────────────────────────
    lines.push(heading('COHORT OVERVIEW'));
    lines.push(row('Cohort Name', 'Type', 'Intake', 'End Date', 'Employer', 'Training Institute', 'Location', 'Seats', 'Filled', 'Enrolled Learners', 'Active', 'At Risk', 'Inactive', 'Transferred', 'Health', 'Phase', 'Ref Number', 'SETA Code', 'NQF Level', 'Funding Source', 'Training Site', 'Transport', 'Transport Provider', 'Stipend Amount (R)'));
    cohorts.forEach((cohort) => {
      const detail = cohortDetails[cohort.id];
      const learners = detail?.learners ?? [];
      const active = learners.filter((l) => l.status === 'active').length;
      const inactive = learners.filter((l) => l.status === 'inactive').length;
      const transferred = learners.filter((l) => l.status === 'transferred').length;
      const atRisk = learners.filter((l) => getStatusBucket(l.status) === 'At Risk').length;
      lines.push(row(
        cohort.name,
        cohort.type === 'ydp' ? 'YDP' : 'Learnership',
        cohort.intake,
        cohort.endDate || '—',
        cohort.employer,
        cohort.institute,
        cohort.location,
        cohort.seats,
        cohort.filled,
        learners.length,
        active,
        atRisk,
        inactive,
        transferred,
        cohort.health.replace('-', ' '),
        cohort.phase,
        detail?.refNumber || '—',
        detail?.setaCode || '—',
        detail?.nqfLevel || '—',
        detail?.fundingSource || '—',
        detail?.trainingSite || '—',
        detail?.transport || '—',
        detail?.transportProvider || '—',
        detail?.stipendAmount || '—',
      ));
    });
    lines.push(blank());

    // ── Learner Status Breakdown ──────────────────────────────────────────────
    lines.push(heading('LEARNER STATUS BREAKDOWN (LEARNERSHIP)'));
    lines.push(row('Status', 'Count', 'Percentage'));
    const lTotal = learnerPopulation.length;
    learnerStatusBreakdown.forEach((s) => {
      const pct = lTotal > 0 ? ((s.value / lTotal) * 100).toFixed(1) + '%' : '0%';
      lines.push(row(s.name, s.value, pct));
    });
    lines.push(row('TOTAL', lTotal, '100%'));
    lines.push(blank());

    lines.push(heading('LEARNER STATUS BREAKDOWN (YDP)'));
    lines.push(row('Status', 'Count', 'Percentage'));
    const yTotal = ydpPopulation.length;
    ydpStatusBreakdown.forEach((s) => {
      const pct = yTotal > 0 ? ((s.value / yTotal) * 100).toFixed(1) + '%' : '0%';
      lines.push(row(s.name, s.value, pct));
    });
    lines.push(row('TOTAL', yTotal, '100%'));
    lines.push(blank());

    // ── All Learners ──────────────────────────────────────────────────────────
    lines.push(heading('ALL LEARNERS — FULL DETAIL'));
    lines.push(row('#', 'Name', 'Cohort', 'Programme', 'Employer', 'Institute', 'Location', 'Status', 'Attendance (%)', 'Overall Score', 'Tasks / Goals Score', 'Skill Set Score', 'Growth Score', 'Appraisal Score', 'Access Card ID', 'Laptop Serial ID', 'SIM Card ID'));

    const allLearners = [...learnerPopulation, ...ydpPopulation];
    allLearners.forEach((learner, i) => {
      const cohort = cohorts.find((c) => c.id === learner.cohortId);
      const scores = calculateOverallPerformance(learner);
      lines.push(row(
        i + 1,
        learner.name,
        cohort?.name ?? learner.cohortId,
        cohort?.type === 'ydp' ? 'YDP' : 'Learnership',
        cohort?.employer ?? '—',
        cohort?.institute ?? '—',
        cohort?.location ?? '—',
        getStatusBucket(learner.status),
        learner.attendance,
        scores.overall,
        scores.taskGoalScore,
        scores.skillScore,
        scores.growthScore,
        scores.appraisalScore,
        learner.accessCardId || '—',
        learner.laptopSerialId || '—',
        learner.simCardId || '—',
      ));
    });
    lines.push(blank());

    // ── Top Performers ────────────────────────────────────────────────────────
    lines.push(heading('TOP PERFORMERS — LEARNERSHIP'));
    lines.push(row('Rank', 'Name', 'Cohort', 'Status', 'Attendance (%)', 'Overall Score', 'Tasks / Goals', 'Skill Set', 'Growth', 'Appraisal'));
    topLearnerPerformers.forEach((l, i) => {
      lines.push(row(i + 1, l.name, l.cohortName, getStatusBucket(l.status), l.attendance, l.scores.overall, l.scores.taskGoalScore, l.scores.skillScore, l.scores.growthScore, l.scores.appraisalScore));
    });
    lines.push(blank());

    lines.push(heading('TOP PERFORMERS — YDP'));
    lines.push(row('Rank', 'Name', 'Cohort', 'Status', 'Attendance (%)', 'Overall Score', 'Tasks / Goals', 'Skill Set', 'Growth', 'Appraisal'));
    topYdpPerformers.forEach((l, i) => {
      lines.push(row(i + 1, l.name, l.cohortName, getStatusBucket(l.status), l.attendance, l.scores.overall, l.scores.taskGoalScore, l.scores.skillScore, l.scores.growthScore, l.scores.appraisalScore));
    });
    lines.push(blank());

    // ── Phase Completion per Cohort ───────────────────────────────────────────
    lines.push(heading('PHASE COMPLETION PER COHORT'));
    lines.push(row('Cohort', 'Phase', 'Completed', 'Start Date', 'End Date', 'Notes'));
    cohorts.forEach((cohort) => {
      const phases = cohortDetails[cohort.id]?.phases ?? [];
      phases.forEach((phase) => {
        lines.push(row(
          cohort.name,
          phase.label,
          phase.completed ? 'Yes' : 'No',
          phase.startDate || '—',
          phase.endDate || '—',
          phase.notes || '—',
        ));
      });
    });

    // UTF-8 BOM ensures Excel opens the file with correct encoding
    const bom = '\uFEFF';
    const csv = bom + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive-report-${period}-${programme}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Full executive report downloaded as CSV', 'success');
  }

  function generateBoardPack() {
    const totalLearners = learnerPopulation.length + ydpPopulation.length;
    const allCohorts = cohorts;
    const generatedAt = new Date().toLocaleString();

    function statusTable(breakdown: typeof learnerStatusBreakdown, population: typeof learnerPopulation) {
      const total = population.length;
      return breakdown.map((s) => {
        const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
        return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${s.name}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600">${s.value}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${pct}%</td></tr>`;
      }).join('');
    }

    function cohortRows() {
      return allCohorts.map((c) => {
        const learners = cohortDetails[c.id]?.learners ?? [];
        const active = learners.filter((l) => l.status === 'active').length;
        const healthColor = c.health === 'on-track' ? '#10b981' : c.health === 'at-risk' ? '#f59e0b' : c.health === 'escalated' ? '#ef4444' : '#3b82f6';
        return `<tr>
          <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb">${c.name}</td>
          <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb">${c.type === 'ydp' ? 'YDP' : 'Learnership'}</td>
          <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb">${c.intake}</td>
          <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb">${c.endDate || '—'}</td>
          <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${learners.length} / ${c.seats}</td>
          <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${active}</td>
          <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb"><span style="color:${healthColor};font-weight:600;text-transform:capitalize">${c.health.replace('-', ' ')}</span></td>
        </tr>`;
      }).join('');
    }

    function topPerformerRows(performers: ReturnType<typeof topPerformersByType>) {
      return performers.slice(0, 5).map((l, i) => `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280">#${i + 1}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${l.name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${l.cohortName}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${l.attendance}%</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:#10b981">${l.scores.overall}</td>
      </tr>`).join('');
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Board Pack — ${period.toUpperCase()} | Learner Assurance</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; margin: 0; padding: 0; background: #fff; }
    .cover { background: #0f172a; color: #fff; padding: 60px; page-break-after: always; }
    .cover h1 { font-size: 2.5rem; margin: 0 0 8px; }
    .cover p { font-size: 1.1rem; color: #94a3b8; margin: 4px 0; }
    .section { padding: 40px 60px; page-break-inside: avoid; }
    .section + .section { border-top: 2px solid #f1f5f9; }
    h2 { font-size: 1.3rem; color: #0f172a; margin: 0 0 16px; border-left: 4px solid #45d0d4; padding-left: 10px; }
    .kpi-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 24px; min-width: 140px; text-align: center; }
    .kpi .label { font-size: 0.8rem; color: #6b7280; margin: 0; }
    .kpi .value { font-size: 2rem; font-weight: 700; color: #0f172a; margin: 4px 0 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    thead th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 600; font-size: 0.82rem; color: #374151; }
    .footer { padding: 24px 60px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 0.82rem; color: #9ca3af; }
    @media print { .section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="cover">
    <h1>Executive Board Pack</h1>
    <p>Period: ${period.replace('q', 'Q').replace('-', ' ')} &nbsp;|&nbsp; Programme: ${programme === 'all' ? 'All Programmes' : programme.toUpperCase()}</p>
    <p>Generated: ${generatedAt}</p>
    <p style="margin-top:40px;font-size:0.85rem;color:#64748b">Learner Assurance Platform &mdash; Confidential</p>
  </div>

  <div class="section">
    <h2>Key Performance Indicators</h2>
    <div class="kpi-row">
      <div class="kpi"><p class="label">Total Learners</p><p class="value">${totalLearners}</p></div>
      <div class="kpi"><p class="label">Learnership</p><p class="value">${learnerPopulation.length}</p></div>
      <div class="kpi"><p class="label">YDP</p><p class="value">${ydpPopulation.length}</p></div>
      <div class="kpi"><p class="label">Total Cohorts</p><p class="value">${allCohorts.length}</p></div>
      <div class="kpi"><p class="label">Completion Rate</p><p class="value">88%</p></div>
      <div class="kpi"><p class="label">SLA Compliance</p><p class="value">97.4%</p></div>
    </div>
  </div>

  <div class="section">
    <h2>Cohort Overview</h2>
    <table>
      <thead><tr><th>Cohort</th><th>Type</th><th>Intake</th><th>End Date</th><th>Learners / Seats</th><th>Active</th><th>Health</th></tr></thead>
      <tbody>${cohortRows()}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Learner Status Breakdown</h2>
    <table>
      <thead><tr><th>Status</th><th style="text-align:center">Count</th><th style="text-align:center">%</th></tr></thead>
      <tbody>${statusTable(learnerStatusBreakdown, learnerPopulation)}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>YDP Status Breakdown</h2>
    <table>
      <thead><tr><th>Status</th><th style="text-align:center">Count</th><th style="text-align:center">%</th></tr></thead>
      <tbody>${statusTable(ydpStatusBreakdown, ydpPopulation)}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Top Performers — Learnership</h2>
    <table>
      <thead><tr><th style="text-align:center">Rank</th><th>Name</th><th>Cohort</th><th style="text-align:center">Attendance</th><th style="text-align:center">Overall Score</th></tr></thead>
      <tbody>${topPerformerRows(topLearnerPerformers)}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Top Performers — YDP</h2>
    <table>
      <thead><tr><th style="text-align:center">Rank</th><th>Name</th><th>Cohort</th><th style="text-align:center">Attendance</th><th style="text-align:center">Overall Score</th></tr></thead>
      <tbody>${topPerformerRows(topYdpPerformers)}</tbody>
    </table>
  </div>

  <div class="footer">Learner Assurance Platform &mdash; ${generatedAt} &mdash; Confidential. For authorised recipients only.</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      addToast('Popup blocked — please allow popups for this site', 'error');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    addToast('Board pack opened — use Ctrl+P / Cmd+P to print or save as PDF', 'success');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Reporting</p>
          <h1 className="page-title">Executive Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="secondary-button" onClick={generateBoardPack}>Generate Board Pack</button>
          <button className="primary-button" onClick={exportReport}>Export Report</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <h2 className="card-title">Report Filters</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="form-input" style={{ maxWidth: 180 }} value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="q1-2026">Q1 2026</option>
              <option value="q2-2026">Q2 2026</option>
              <option value="q3-2026">Q3 2026</option>
            </select>
            <select className="form-input" style={{ maxWidth: 220 }} value={programme} onChange={(e) => setProgramme(e.target.value)}>
              <option value="all">All programmes</option>
              <option value="learnership">Learnership</option>
              <option value="ydp">YDP</option>
            </select>
            <select className="form-input" style={{ maxWidth: 180 }} value={crossFilterStatus} onChange={(e) => setCrossFilterStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="on-track">On Track</option>
              <option value="at-risk">At Risk</option>
              <option value="escalated">Escalated</option>
              <option value="completed">Completed</option>
            </select>
            <select className="form-input" style={{ maxWidth: 180 }} value={crossFilterRisk} onChange={(e) => setCrossFilterRisk(e.target.value)}>
              <option value="all">All risk bands</option>
              <option value="at-risk">At Risk</option>
              <option value="escalated">Escalated</option>
            </select>
            <button className="secondary-button" onClick={() => addToast(`Applied ${period} / ${programme} filters`, 'info')}>Apply</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">Executive Snapshot History</h2>
          <button
            className="action-btn"
            onClick={() => {
              const next = {
                id: crypto.randomUUID(),
                label: `Snapshot ${snapshotHistory.length + 1}`,
                period,
                programme,
                at: new Date().toLocaleString(),
              };
              setSnapshotHistory((prev) => [next, ...prev]);
              addToast('Snapshot captured.', 'success');
            }}
          >Capture Snapshot</button>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {snapshotHistory.map((snapshot) => (
            <div key={snapshot.id} style={{ border: '1px solid var(--input-border)', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{snapshot.label}</p>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                  {snapshot.period} • {snapshot.programme} • {snapshot.at}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="action-btn" onClick={() => addToast(`Restored ${snapshot.label}`, 'info')}>Restore</button>
                <button className="action-btn" onClick={() => addToast(`Comparing live view against ${snapshot.label}`, 'info')}>Compare</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        <button className="kpi-card" onClick={() => navigate('/reports/learners')}><h3>Total Learners</h3><p>{learnerPopulation.length + ydpPopulation.length}</p></button>
        <button className="kpi-card kpi-green" onClick={() => navigate('/reports/completion')}><h3>Completion Rate</h3><p>88%</p></button>
        <button className="kpi-card kpi-green" onClick={() => navigate('/reports/compliance')}><h3>SLA Compliance</h3><p>97.4%</p></button>
        <button className="kpi-card kpi-yellow" onClick={() => navigate('/reports/risk')}><h3>Risk Distribution</h3><p>24.8%</p></button>
      </div>

      <div className="kpi-grid" style={{ marginTop: 12 }}>
        <div className="kpi-card"><h3>Intervention Closure</h3><p>81%</p></div>
        <div className="kpi-card"><h3>Evidence Compliance</h3><p>92%</p></div>
        <div className="kpi-card kpi-yellow"><h3>Target Variance</h3><p>-3.2%</p></div>
        <div className="kpi-card"><h3>Placement Rate</h3><p>74%</p></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Compliance Rate (6 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={COMPLIANCE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis domain={[80, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Line type="monotone" dataKey="compliance" stroke="#45d0d4" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="card-title">Programme Completion Rate</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RATE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} />
              <Bar
                dataKey="completion"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                onClick={(entry) => {
                  if (entry?.month) navigate(`/reports/completion?month=${encodeURIComponent(String(entry.month))}`);
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Learner Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={learnerStatusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {learnerStatusBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} formatter={(value) => `${value} learners`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
            {learnerStatusBreakdown.map((status) => {
              const total = learnerStatusBreakdown.reduce((sum, s) => sum + s.value, 0);
              const percent = total > 0 ? Math.round((status.value / total) * 100) : 0;
              return (
                <div key={status.name} style={{ padding: '12px', background: `${status.fill}15`, borderRadius: 8, borderLeft: `4px solid ${status.fill}` }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{status.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                    <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{status.value}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{percent}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">YDP Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ydpStatusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {ydpStatusBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} formatter={(value) => `${value} learners`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
            {ydpStatusBreakdown.map((status) => {
              const total = ydpStatusBreakdown.reduce((sum, s) => sum + s.value, 0);
              const percent = total > 0 ? Math.round((status.value / total) * 100) : 0;
              return (
                <div key={status.name} style={{ padding: '12px', background: `${status.fill}15`, borderRadius: 8, borderLeft: `4px solid ${status.fill}` }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{status.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                    <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{status.value}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{percent}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h2 className="card-title">Top Performers (Learners)</h2>
          <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Ranked by overall performance (tasks/goals, skill set, growth, appraisal, attendance)
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {topLearnerPerformers.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No learner records match current filters.</p>
            ) : (
              topLearnerPerformers.map((learner, index) => (
                <div key={learner.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>#{index + 1}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500 }}>{learner.name}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{learner.cohortName}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{learner.scores.overall}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Top Performers (YDP)</h2>
          <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Ranked by overall performance (tasks/goals, skill set, growth, appraisal, attendance)
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {topYdpPerformers.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No YDP records match current filters.</p>
            ) : (
              topYdpPerformers.map((learner, index) => (
                <div key={learner.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>#{index + 1}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500 }}>{learner.name}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{learner.cohortName}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{learner.scores.overall}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header" style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="card-title">Learnership Contract Timeline</h2>
            <select
              className="form-input"
              style={{ maxWidth: 280 }}
              value={learnershipTimelineCohortId}
              onChange={(e) => setLearnershipTimelineCohortId(e.target.value)}
            >
              {learnershipCohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
              ))}
            </select>
          </div>
          {!learnershipTimeline ? (
            <p style={{ color: 'var(--text-muted)' }}>No learnership cohorts available.</p>
          ) : (
            <>
              <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Learners in cohort: {learnershipTimeline.learnerCount} • Start: {learnershipTimeline.startLabel} • End: {learnershipTimeline.endLabel}
              </p>
              <div style={{ height: 14, borderRadius: 999, background: 'var(--input-border)' }}>
                <div style={{ height: '100%', width: `${learnershipTimeline.progress}%`, borderRadius: 999, background: '#10b981' }} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {learnershipTimeline.elapsedDays ?? 0} elapsed days
                {learnershipTimeline.totalDays ? ` / ${learnershipTimeline.totalDays} contract days` : ''}
              </p>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-header" style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="card-title">YDP Contract Timeline</h2>
            <select
              className="form-input"
              style={{ maxWidth: 280 }}
              value={ydpTimelineCohortId}
              onChange={(e) => setYdpTimelineCohortId(e.target.value)}
            >
              {ydpCohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
              ))}
            </select>
          </div>
          {!ydpTimeline ? (
            <p style={{ color: 'var(--text-muted)' }}>No YDP cohorts available.</p>
          ) : (
            <>
              <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Learners in cohort: {ydpTimeline.learnerCount} • Start: {ydpTimeline.startLabel} • End: {ydpTimeline.endLabel}
              </p>
              <div style={{ height: 14, borderRadius: 999, background: 'var(--input-border)' }}>
                <div style={{ height: '100%', width: `${ydpTimeline.progress}%`, borderRadius: 999, background: '#3b82f6' }} />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {ydpTimeline.elapsedDays ?? 0} elapsed days
                {ydpTimeline.totalDays ? ` / ${ydpTimeline.totalDays} contract days` : ''}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Cohort Health Summary ───────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title">Cohort Health Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {cohortHealthSummary.map((item) => (
            <div key={item.label} style={{ padding: '14px 16px', background: `${item.color}15`, borderRadius: 10, borderLeft: `4px solid ${item.color}` }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.count}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>cohort{item.count !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 0, height: 10, borderRadius: 999, overflow: 'hidden' }}>
          {cohortHealthSummary.filter((i) => i.count > 0).map((item) => (
            <div key={item.label} title={`${item.label}: ${item.count}`} style={{ flex: item.count, background: item.color }} />
          ))}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cohorts.length} total cohorts across all programmes</p>
      </div>

      {/* ── Attendance Trend by Cohort ──────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title">Average Attendance by Cohort</h2>
        <p style={{ marginTop: 0, marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.83rem' }}>Avg attendance % across all enrolled learners per cohort. Cohorts below 75% may need intervention.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={attendanceByCohort} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={130} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: 'none', borderRadius: 10 }} formatter={(v) => [`${v}%`, 'Avg Attendance']} />
            <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
              {attendanceByCohort.map((entry, i) => (
                <Cell key={i} fill={entry.avg >= 80 ? '#10b981' : entry.avg >= 70 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          {[{ color: '#10b981', label: '≥ 80% — Healthy' }, { color: '#f59e0b', label: '70–79% — Watch' }, { color: '#ef4444', label: '< 70% — Intervention needed' }].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />{l.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── At-Risk Learners Panel ──────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">At-Risk Learners</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>All inactive / at-risk learners across every cohort, sorted by lowest attendance first</p>
          </div>
          <span style={{ background: '#ef444420', color: '#ef4444', fontWeight: 700, padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem' }}>{atRiskLearners.length} at risk</span>
        </div>
        {atRiskLearners.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-muted)', fontStyle: 'italic' }}>No at-risk learners — all cohorts healthy.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--input-border)' }}>
                  {['Learner', 'Cohort', 'Type', 'Attendance', 'Overall Score', 'Tasks/Goals', 'Skill', 'Growth', 'Appraisal'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Learner' || h === 'Cohort' || h === 'Type' ? 'left' : 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atRiskLearners.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--input-border)' }}>
                    <td style={{ padding: '9px 12px', fontWeight: 600 }}>{l.name}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text-secondary)', fontSize: '0.83rem' }}>{l.cohortName}</td>
                    <td style={{ padding: '9px 12px' }}><span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: 20, background: l.cohortType === 'ydp' ? '#3b82f620' : '#45d0d420', color: l.cohortType === 'ydp' ? '#3b82f6' : '#45d0d4', fontWeight: 600 }}>{l.cohortType === 'ydp' ? 'YDP' : 'Learnership'}</span></td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: l.attendance < 70 ? '#ef4444' : '#f59e0b' }}>{l.attendance}%</span>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#f59e0b' }}>{l.scores.overall}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{l.scores.taskGoalScore}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{l.scores.skillScore}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{l.scores.growthScore}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{l.scores.appraisalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Stipend & Funding Summary ───────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title">Stipend &amp; Funding Summary</h2>
        <p style={{ marginTop: 0, marginBottom: 16, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>Total stipend commitment per funding source based on enrolled learners and monthly stipend amounts.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--input-border)' }}>
                {['Funding Source', 'Cohorts', 'Enrolled Learners', 'Total Monthly Stipend (R)'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Funding Source' ? 'left' : 'center', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fundingSummary.map((row) => (
                <tr key={row.source} style={{ borderBottom: '1px solid var(--input-border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.source}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.count}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{row.seats}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#10b981' }}>R {row.totalStipend.toLocaleString()}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--input-border)', background: 'var(--surface-alt, var(--surface))' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>TOTAL</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{cohorts.length}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{fundingSummary.reduce((s, r) => s + r.seats, 0)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#10b981' }}>R {fundingSummary.reduce((s, r) => s + r.totalStipend, 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Risk Cohorts</h2>
            <button className="action-btn" onClick={() => navigate('/reports/risk')}>View All Risks</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { name: 'YDP Cohort 2026-Q1', risk: '29%', owner: 'Metro Academy', riskLevel: 'high' },
              { name: 'Learnership 2026-A', risk: '18%', owner: 'North Skills Institute', riskLevel: 'medium' },
              { name: 'YDP Cohort 2025-Q4', risk: '16%', owner: 'Future Finance Group', riskLevel: 'low' },
            ].map((riskRow) => (
              <button
                key={riskRow.name}
                style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 10, textAlign: 'left', background: 'var(--surface)' }}
                onClick={() => navigate(`/reports/risk?risk=${encodeURIComponent(riskRow.riskLevel)}`)}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>{riskRow.name}</p>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{riskRow.owner} • Risk rate {riskRow.risk}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Scheduled Report Delivery</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <input
              className="form-input"
              value={deliveryEmail}
              onChange={(e) => setDeliveryEmail(e.target.value)}
              placeholder="recipient emails separated by commas"
            />
            <select className="form-input" value={deliveryFrequency} onChange={(e) => setDeliveryFrequency(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select className="form-input" value={deliveryFormat} onChange={(e) => setDeliveryFormat(e.target.value as 'pdf' | 'xlsx' | 'pptx')}>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="pptx">PowerPoint (PPTX)</option>
            </select>
            <button className="primary-button" onClick={() => addToast(`Scheduled ${deliveryFrequency} ${deliveryFormat.toUpperCase()} report to ${deliveryEmail}`, 'success')}>
              Save Delivery Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

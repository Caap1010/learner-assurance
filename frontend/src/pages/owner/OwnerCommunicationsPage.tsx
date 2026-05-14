import { useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import { usePlatformData } from '../../context/PlatformDataContext';
import { useToast } from '../../context/ToastContext';

function toDateTimeLocalValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function OwnerCommunicationsPage() {
  const { addToast } = useToast();
  const {
    communicationTemplates,
    upsertCommunicationTemplate,
    communicationCampaigns,
    createCommunicationCampaign,
    markCampaignSent,
  } = usePlatformData();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [audience, setAudience] = useState('All users');
  const [channel, setChannel] = useState<'Email' | 'SMS' | 'In-App'>('Email');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateAudience, setTemplateAudience] = useState('All users');
  const [templateChannel, setTemplateChannel] = useState<'Email' | 'SMS' | 'In-App'>('Email');
  const [templateBody, setTemplateBody] = useState('');

  const selectedTemplate = useMemo(
    () => communicationTemplates.find((template) => template.id === selectedTemplateId) ?? null,
    [communicationTemplates, selectedTemplateId],
  );

  const campaignStats = useMemo(() => {
    const sent = communicationCampaigns.filter((campaign) => campaign.status === 'Sent').length;
    const scheduled = communicationCampaigns.filter((campaign) => campaign.status === 'Scheduled').length;
    const drafts = communicationCampaigns.filter((campaign) => campaign.status === 'Draft').length;
    const flagged = communicationCampaigns.filter((campaign) => campaign.status === 'Scheduled' || campaign.status === 'Draft').length;
    return { sent, scheduled, drafts, flagged };
  }, [communicationCampaigns]);

  const canSendNow = useMemo(() => title.trim().length >= 4 && message.trim().length >= 8, [message, title]);

  const canSchedule = useMemo(() => {
    if (title.trim().length < 4 || message.trim().length < 8) return false;
    if (!scheduleAt) return false;
    const parsed = Date.parse(scheduleAt);
    return Number.isFinite(parsed) && parsed > Date.now();
  }, [message, scheduleAt, title]);

  const canSaveTemplate = useMemo(() => templateTitle.trim().length >= 4 && templateBody.trim().length >= 8 && templateAudience.trim().length >= 3, [templateAudience, templateBody, templateTitle]);

  const minScheduleDateTime = useMemo(() => toDateTimeLocalValue(new Date()), []);

  function applyTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = communicationTemplates.find((entry) => entry.id === templateId);
    if (!template) return;
    setTitle(template.title);
    setAudience(template.audience);
    setChannel(template.channel);
    setMessage(template.body);
  }

  function openCreateTemplateModal() {
    setEditingTemplateId(null);
    setTemplateTitle('');
    setTemplateAudience('All users');
    setTemplateChannel('Email');
    setTemplateBody('');
    setTemplateModalOpen(true);
  }

  function openEditTemplate(templateId: string) {
    const template = communicationTemplates.find((entry) => entry.id === templateId);
    if (!template) return;
    setEditingTemplateId(templateId);
    setTemplateTitle(template.title);
    setTemplateAudience(template.audience);
    setTemplateChannel(template.channel);
    setTemplateBody(template.body);
    setTemplateModalOpen(true);
  }

  function sendNow() {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!canSendNow) {
      addToast('Add title and message before sending.', 'warning');
      return;
    }
    createCommunicationCampaign({
      title: trimmedTitle,
      target: audience,
      channel,
      message: trimmedMessage,
      templateId: selectedTemplateId || undefined,
      status: 'Sent',
    });
    setTitle('');
    setMessage('');
    setSelectedTemplateId('');
    addToast('Broadcast sent successfully.', 'success');
  }

  function scheduleCampaign() {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!canSchedule || !trimmedTitle || !trimmedMessage) {
      addToast('Add title and message before scheduling.', 'warning');
      return;
    }
    createCommunicationCampaign({
      title: trimmedTitle,
      target: audience,
      channel,
      message: trimmedMessage,
      templateId: selectedTemplateId || undefined,
      status: 'Scheduled',
      scheduledAt: new Date(scheduleAt).toISOString(),
    });
    setTitle('');
    setMessage('');
    setScheduleAt('');
    setSelectedTemplateId('');
    addToast('Message scheduled.', 'success');
  }

  function saveTemplate() {
    const trimmedTitle = templateTitle.trim();
    const trimmedBody = templateBody.trim();
    if (!canSaveTemplate) {
      addToast('Template title and body are required.', 'warning');
      return;
    }
    upsertCommunicationTemplate(
      {
        title: trimmedTitle,
        audience: templateAudience,
        channel: templateChannel,
        body: trimmedBody,
      },
      editingTemplateId ?? undefined,
    );
    setTemplateTitle('');
    setTemplateBody('');
    setTemplateAudience('All users');
    setTemplateChannel('Email');
    setEditingTemplateId(null);
    setTemplateModalOpen(false);
    addToast('Communication template saved.', 'success');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Owner Control Center</p>
          <h1 className="page-title">Communications</h1>
        </div>
        <button className="primary-button" onClick={openCreateTemplateModal}>+ New Template</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Templates</h3><p>{communicationTemplates.length}</p></div>
        <div className="kpi-card kpi-green"><h3>Sent Campaigns</h3><p>{campaignStats.sent}</p></div>
        <div className="kpi-card"><h3>Scheduled</h3><p>{campaignStats.scheduled}</p></div>
        <div className="kpi-card kpi-yellow"><h3>Drafts</h3><p>{campaignStats.drafts}</p></div>
        <div className="kpi-card kpi-red"><h3>Pending Attention</h3><p>{campaignStats.flagged}</p></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Broadcast Composer</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="form-label">
            Use template
            <select className="form-input" value={selectedTemplateId} onChange={(event) => applyTemplate(event.target.value)}>
              <option value="">No template</option>
              {communicationTemplates.map((template) => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
          </label>
          <input
            className="form-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Campaign title"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <select className="form-input" value={audience} onChange={(event) => setAudience(event.target.value)}>
              <option value="All users">All users</option>
              <option value="All Cohorts">All cohorts</option>
              <option value="Institute Managers">Institute managers</option>
              <option value="Employer Sponsors">Employer sponsors</option>
              <option value="Operational owners">Operational owners</option>
            </select>
            <select className="form-input" value={channel} onChange={(event) => setChannel(event.target.value as 'Email' | 'SMS' | 'In-App')}>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="In-App">In-App</option>
            </select>
            <input type="datetime-local" min={minScheduleDateTime} className="form-input" value={scheduleAt} onChange={(event) => setScheduleAt(event.target.value)} />
          </div>
          {selectedTemplate && (
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Template audience: {selectedTemplate.audience} · Channel: {selectedTemplate.channel}
            </p>
          )}
          <textarea
            className="form-input"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement or reminder"
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="primary-button" onClick={sendNow} disabled={!canSendNow}>Send Now</button>
            <button className="secondary-button" onClick={scheduleCampaign} disabled={!canSchedule}>Schedule</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>Template Library</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Title</th>
                <th className="datatable-th">Audience</th>
                <th className="datatable-th">Channel</th>
                <th className="datatable-th">Updated</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {communicationTemplates.map((template) => (
                <tr key={template.id}>
                  <td>{template.title}</td>
                  <td>{template.audience}</td>
                  <td>{template.channel}</td>
                  <td>{new Date(template.updatedAt).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="action-btn" onClick={() => applyTemplate(template.id)}>Use</button>
                      <button className="action-btn" onClick={() => openEditTemplate(template.id)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Recent Campaigns</h2>
        <div className="datatable-scroll">
          <table className="datatable">
            <thead>
              <tr>
                <th className="datatable-th">Title</th>
                <th className="datatable-th">Audience</th>
                <th className="datatable-th">Channel</th>
                <th className="datatable-th">Time</th>
                <th className="datatable-th">Status</th>
                <th className="datatable-th">Template</th>
                <th className="datatable-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {communicationCampaigns.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.target}</td>
                  <td>{row.channel}</td>
                  <td>{new Date(row.sentAt ?? row.scheduledAt ?? row.createdAt).toLocaleString()}</td>
                  <td>{row.status}</td>
                  <td>{row.templateId ? communicationTemplates.find((template) => template.id === row.templateId)?.title ?? '-' : '-'}</td>
                  <td>
                    {row.status !== 'Sent' ? (
                      <button className="action-btn" onClick={() => { markCampaignSent(row.id); addToast('Campaign marked as sent.', 'success'); }}>Mark Sent</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {templateModalOpen && (
        <Modal
          title={editingTemplateId ? 'Edit Communication Template' : 'Create Communication Template'}
          onClose={() => setTemplateModalOpen(false)}
          footer={(
            <>
              <button className="secondary-button" onClick={() => setTemplateModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={saveTemplate} disabled={!canSaveTemplate}>{editingTemplateId ? 'Save Template' : 'Create Template'}</button>
            </>
          )}
        >
          <label className="form-label">
            Template title
            <input className="form-input" value={templateTitle} onChange={(event) => setTemplateTitle(event.target.value)} />
          </label>
          <label className="form-label">
            Audience
            <input className="form-input" value={templateAudience} onChange={(event) => setTemplateAudience(event.target.value)} />
          </label>
          <label className="form-label">
            Channel
            <select className="form-input" value={templateChannel} onChange={(event) => setTemplateChannel(event.target.value as 'Email' | 'SMS' | 'In-App')}>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="In-App">In-App</option>
            </select>
          </label>
          <label className="form-label">
            Template body
            <textarea className="form-input" rows={5} value={templateBody} onChange={(event) => setTemplateBody(event.target.value)} />
          </label>
        </Modal>
      )}
    </div>
  );
}

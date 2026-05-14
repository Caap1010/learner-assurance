import { useState } from 'react';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { EVIDENCE, LEARNERS } from '../../data/mockData';

const FILE_ICONS: Record<string, string> = { PDF: '📄', PPTX: '📊', PNG: '🖼', DOCX: '📝' };

export default function EvidencePage() {
  const { addToast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addToast(`File dropped — ready to upload`, 'info');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Portfolio</p>
          <h1 className="page-title">Evidence</h1>
        </div>
        <button className="primary-button" onClick={() => setUploadOpen(true)}>+ Upload Evidence</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Files</h3><p>{EVIDENCE.length}</p></div>
        <div className="kpi-card"><h3>PDFs</h3><p>{EVIDENCE.filter(e => e.fileType === 'PDF').length}</p></div>
        <div className="kpi-card"><h3>Presentations</h3><p>{EVIDENCE.filter(e => e.fileType === 'PPTX').length}</p></div>
        <div className="kpi-card"><h3>Images</h3><p>{EVIDENCE.filter(e => e.fileType === 'PNG').length}</p></div>
      </div>

      <div className="card">
        <h2 className="card-title">Evidence Files</h2>
        <div className="evidence-grid">
          {EVIDENCE.map(e => (
            <div key={e.id} className="evidence-card">
              <div className="evidence-icon">{FILE_ICONS[e.fileType] ?? '📎'}</div>
              <div className="evidence-details">
                <p style={{ margin: 0, fontWeight: 600, wordBreak: 'break-word' }}>{e.title}</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Linked: {e.linkedTo} · {e.fileSize}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Uploaded {e.uploadedAt}</p>
              </div>
              <div className="evidence-actions">
                <span className="file-badge">{e.fileType}</span>
                <button className="action-btn" onClick={() => addToast(`Downloading ${e.title}`, 'info')}>Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {uploadOpen && (
        <Modal
          title="Upload Evidence"
          onClose={() => setUploadOpen(false)}
          footer={
            <>
              <button className="primary-button" onClick={() => { setUploadOpen(false); addToast('Evidence uploaded', 'success'); }}>Upload</button>
              <button className="secondary-button" onClick={() => setUploadOpen(false)}>Cancel</button>
            </>
          }
        >
          <label className="form-label"><span>Learner</span>
            <select className="form-input">{LEARNERS.map(l => <option key={l.id}>{l.name}</option>)}</select>
          </label>
          <label className="form-label"><span>Link to unit / goal</span>
            <input type="text" className="form-input" placeholder="e.g. Unit 4" />
          </label>

          <div
            className={`dropzone ${dragging ? 'dropzone-active' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Drag and drop your file here, or
            </p>
            <label className="upload-label">
              <input type="file" style={{ display: 'none' }} onChange={() => addToast('File selected', 'info')} />
              <span>Browse files</span>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}

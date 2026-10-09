import { useEffect, useState } from 'react';

export default function StatusMessage({ error, success, confirmation, onConfirm, onCancel }) {
  const [visible, setVisible] = useState(false);
  const content = confirmation ? `Remove ${confirmation}?` : (error || success || '');

  useEffect(() => {
    if (!content) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    if (confirmation) return undefined;
    const timer = window.setTimeout(() => setVisible(false), 3800);
    return () => window.clearTimeout(timer);
  }, [content, confirmation]);

  if (!content || !visible) return null;
  const type = confirmation ? 'confirmation' : error ? 'error' : 'success';
  return (
    <div className={`toast-message toast-${type}`} role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'}>
      <span className="toast-icon" aria-hidden="true">{confirmation ? '？' : error ? '!' : '✓'}</span>
      <div className="toast-content">
        <span className="toast-text">{content}</span>
        {confirmation && <div className="toast-actions">
          <button type="button" className="toast-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="toast-confirm" onClick={onConfirm}>Remove</button>
        </div>}
      </div>
      {!confirmation && <button type="button" className="toast-dismiss" aria-label="Dismiss message" onClick={() => setVisible(false)}>×</button>}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api.js';
import MenuCard from '../components/MenuCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

export default function DashboardPage() {
  const [data, setData] = useState({ menu: null, date: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      setError('');
      setData(await api.today());
    } catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function generate() {
    setBusy(true); setMessage(''); setError('');
    try {
      const menu = await api.generate(data.date);
      setData({ date: data.date, menu });
      setMessage('Today’s menu generated.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function email() {
    setBusy(true); setMessage(''); setError('');
    try {
      await api.emailMenu(data.date);
      setMessage('Menu email sent.');
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="hero">
        <div>
          <p className="eyebrow">TODAY'S PLAN</p>
          <h1>Breakfast → lunch → snack → dinner</h1>
          <p className="muted">A practical homemade Indian menu with drinks, mains, sides, dal, rice, breads and dessert.</p>
        </div>
        <div className="actions">
          <button onClick={generate} disabled={busy}>{busy ? 'Working…' : 'Generate today'}</button>
          <button className="secondary" onClick={email} disabled={busy || !data.menu}>Email menu</button>
        </div>
      </div>
      <StatusMessage error={error} success={message} />
      <div className="date-pill">{data.date}</div>
      <MenuCard menu={data.menu} />
    </>
  );
}

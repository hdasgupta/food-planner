import { useEffect, useState } from 'react';
import { api } from '../api.js';
import MenuCard from '../components/MenuCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

export default function MenuPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [menu, setMenu] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState('');
  const [slot, setSlot] = useState('Breakfast');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    try {
      setError('');
      const menus = await api.menus(date, date);
      setMenu(menus[0] || null);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); }, [date]);

  useEffect(() => {
    api.recipes().then(setRecipes).catch(e => setError(e.message));
  }, []);

  async function generate() {
    try {
      setSuccess('');
      setMenu(await api.generate(date));
      setSuccess(`Generated menu for ${date}.`);
    } catch (e) { setError(e.message); }
  }

  async function addRecipe() {
    if (!menu || !selected) return;
    try {
      const recipeId = Number(selected);
      const items = [...menu.items, { mealSlot: slot, displayOrder: menu.items.length, recipeId }];
      const updated = await api.updateMenu(date, { notes: menu.notes, items });
      setMenu(updated);
      setSuccess('Menu updated.');
    } catch (e) { setError(e.message); }
  }

  async function removeItem(id) {
    try {
      const items = menu.items.filter(x => x.id !== id).map((x, i) => ({
        mealSlot: x.mealSlot, displayOrder: i, recipeId: x.recipe.id
      }));
      setMenu(await api.updateMenu(date, { notes: menu.notes, items }));
      setSuccess('Item removed.');
    } catch (e) { setError(e.message); }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PLANNER</p>
          <h1>Build a menu for any date</h1>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <StatusMessage error={error} success={success} />
      <div className="toolbar">
        <button onClick={generate}>Generate balanced plan</button>
        <select value={slot} onChange={e => setSlot(e.target.value)}>
          {['Breakfast','Breakfast drink','Lunch main','Lunch dal','Lunch rice','Lunch bread','Lunch side','Evening snack','Evening drink','Dinner main','Dinner dal','Dinner rice','Dinner bread','Dinner side','Dessert'].map(x => <option key={x}>{x}</option>)}
        </select>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Add a recipe…</option>
          {recipes.map(r => <option key={r.id} value={r.id}>{r.name} — {r.category_name}</option>)}
        </select>
        <button className="secondary" onClick={addRecipe} disabled={!menu || !selected}>Add</button>
      </div>
      {menu && (
        <div className="editable-list">
          {menu.items.map(item => (
            <div className="editable-row" key={item.id}>
              <span><strong>{item.mealSlot}</strong> — {item.recipe.name}</span>
              <button className="danger" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
      <MenuCard menu={menu} />
    </>
  );
}

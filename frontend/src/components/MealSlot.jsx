import { useState } from 'react';

export const MEALS = [
  ['breakfast', 'Breakfast'],
  ['lunch', 'Lunch'],
  ['evening_snack', 'Evening Snack'],
  ['dinner', 'Dinner']
];

function ActionIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  if (name === 'edit') {
    return <svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>;
  }
  if (name === 'remove') {
    return <svg {...common}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>;
  }
  return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h7"/></svg>;
}

export default function MealSlot({ title, items, onEdit, onRemove, onShowRecipe, disabled = false }) {
  const [expandedName, setExpandedName] = useState(null);

  return <section className="meal-slot">
    <div className="slot-heading">
      <h2>{title}</h2>
      <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
    </div>
    {items.length === 0 ? <div className="empty-slot">No food selected yet.</div> :
      items.map(item => {
        const itemKey = item.id ?? item._key;
        const nameExpanded = expandedName === itemKey;
        return <div className="planned-item" key={itemKey}>
        <div className="planned-item-copy">
          <strong className="planned-item-name" title={item.recipeName} role="button" tabIndex={0} aria-expanded={nameExpanded}
            onClick={() => setExpandedName(current => current === itemKey ? null : itemKey)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setExpandedName(current => current === itemKey ? null : itemKey); } }}>{item.recipeName}</strong>
          {nameExpanded && <span className="recipe-name-tooltip" role="tooltip">{item.recipeName}</span>}
          <small title={`${item.category} · ${item.quantity} ${item.unit}`}>{item.category} · {item.quantity} {item.unit}</small>
        </div>
        <div className="icon-actions">
          <button type="button" className="icon-button" onClick={() => onEdit(item)} disabled={disabled}
            title={`Edit ${item.recipeName}`} aria-label={`Edit ${item.recipeName}`}><ActionIcon name="edit" /></button>
          <button type="button" className="icon-button view" onClick={() => onShowRecipe(item)} disabled={disabled}
            title={`Show recipe for ${item.recipeName}`} aria-label={`Show recipe for ${item.recipeName}`}><ActionIcon name="recipe" /></button>
          <button type="button" className="icon-button danger" onClick={() => onRemove(item)} disabled={disabled}
            title={`Remove ${item.recipeName}`} aria-label={`Remove ${item.recipeName}`}><ActionIcon name="remove" /></button>
        </div>
      </div>;
      })}
  </section>;
}

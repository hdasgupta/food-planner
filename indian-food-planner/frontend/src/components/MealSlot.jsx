export const MEALS = [
  ['breakfast','Breakfast'],
  ['mid_morning','Mid-morning'],
  ['lunch','Lunch'],
  ['evening_snack','Evening Snack'],
  ['dinner','Dinner']
];

export default function MealSlot({title,items,onRemove}){
  return <section className="meal-slot">
    <div className="slot-heading"><h2>{title}</h2><span>{items.length} item{items.length!==1?'s':''}</span></div>
    {items.length===0?<div className="empty-slot">No food selected yet.</div>:
      items.map(item=><div className="planned-item" key={item._key || item.id}>
        <div><strong>{item.recipeName}</strong><small>{item.category} · {item.quantity} {item.unit}</small></div>
        {onRemove && <button onClick={()=>onRemove(item)} aria-label={`Remove ${item.recipeName}`}>×</button>}
      </div>)}
  </section>;
}

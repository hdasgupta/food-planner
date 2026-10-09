import { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import RecipePicker from '../components/RecipePicker.jsx';
import MealSlot, {MEALS} from '../components/MealSlot.jsx';

function today(){return new Date().toLocaleDateString('en-CA');}

export default function Planner(){
 const [date,setDate]=useState(today()), [plan,setPlan]=useState({items:[],notes:''}), [error,setError]=useState(''), [saved,setSaved]=useState(false);
 const [pickerOpen,setPickerOpen]=useState(false), [activeSlot,setActiveSlot]=useState('breakfast');
 const load=()=>api.get(`/plans/${date}`).then(r=>setPlan(r.data.plan)).catch(e=>setError(e.response?.data?.error||'Could not load plan'));
 useEffect(()=>{load()},[date]);
 const grouped=useMemo(()=>Object.fromEntries(MEALS.map(([key])=>[key,plan.items.filter(i=>i.mealSlot===key)])),[plan.items]);
 const add=recipe=>{
   setPlan(p=>({...p,items:[...p.items,{_key:crypto.randomUUID(),mealSlot:activeSlot,recipeId:recipe.id,recipeName:recipe.name,category:recipe.category_name,quantity:1,unit:'serving'}]}));
   setPickerOpen(false);
 };
 const remove=item=>setPlan(p=>({...p,items:p.items.filter(i=>i._key!==item._key && i.id!==item.id)}));
 const save=async()=>{setError('');try{const payload={notes:plan.notes,items:plan.items.map(({mealSlot,recipeId,quantity,unit})=>({mealSlot,recipeId,quantity,unit}))};const r=await api.put(`/plans/${date}`,payload);setPlan(r.data.plan);setSaved(true);setTimeout(()=>setSaved(false),1800)}catch(e){setError(e.response?.data?.error||'Could not save plan')}};
 return <div>
  <div className="page-header"><div><h1>Daily Food Planner</h1><p>Choose your homemade menu from breakfast to dinner.</p></div>
   <div className="date-actions"><input type="date" value={date} onChange={e=>setDate(e.target.value)}/><button className="primary" onClick={save}>Save Menu</button></div>
  </div>
  {saved&&<div className="success">Menu saved.</div>}{error&&<div className="error">{error}</div>}
  <div className="planner-grid">{MEALS.map(([key,title])=><div key={key}><MealSlot title={title} items={grouped[key]} onRemove={remove}/><button className="add-food" onClick={()=>{setActiveSlot(key);setPickerOpen(true)}}>＋ Add food</button></div>)}</div>
  <label className="notes"><span>Notes for this day</span><textarea value={plan.notes||''} onChange={e=>setPlan({...plan,notes:e.target.value})} placeholder="Guests, leftovers, fasting day, special preparation…"/></label>
  {pickerOpen&&<div className="modal-backdrop" onClick={()=>setPickerOpen(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-title"><h2>Add to {MEALS.find(x=>x[0]===activeSlot)?.[1]}</h2><button onClick={()=>setPickerOpen(false)}>×</button></div><RecipePicker onAdd={add}/></div></div>}
 </div>;
}

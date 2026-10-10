import { useEffect, useState } from 'react';
import api from '../services/api.js';

const FOOD_IMAGES = ['photo-1546069901-ba9599a7e63c','photo-1540189549336-e6e99c3679fe','photo-1512621776951-a57141f2eefd','photo-1547592180-85f173990554','photo-1476224203421-9ac39bcb3327','photo-1565299624946-b28f40a0ae38','photo-1565299507177-b0ac66763828','photo-1504674900247-0877df9cc836'];
function fallbackFoodImage(name = '') { const hash = [...String(name)].reduce((sum, char) => sum + char.charCodeAt(0), 0); return `https://images.unsplash.com/${FOOD_IMAGES[hash % FOOD_IMAGES.length]}?auto=format&fit=crop&w=640&q=80`; }

export default function RecipePicker({onAdd}){
  const [recipes,setRecipes]=useState([]);
  const [categories,setCategories]=useState([]);
  const [search,setSearch]=useState('');
  const [categoryId,setCategoryId]=useState('');
  const [loading,setLoading]=useState(false);
  useEffect(()=>{api.get('/recipes/categories').then(r=>setCategories(r.data.categories));},[]);
  useEffect(()=>{
    setLoading(true);
    api.get('/recipes',{params:{search,categoryId,limit:300}})
      .then(r=>setRecipes(r.data.recipes)).finally(()=>setLoading(false));
  },[search,categoryId]);
  return <section className="picker">
    <div className="picker-tools">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search rice, dal, paratha..." />
      <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
        <option value="">All categories</option>
        {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
    {loading ? <p>Loading recipes…</p> :
      <div className="recipe-grid">{recipes.map(r=><button key={r.id} className="recipe-card" onClick={()=>onAdd(r)}>
        {r.image_url && <img className="recipe-card-image" src={r.image_url} alt={r.name} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackFoodImage(r.name); }} />}
        <strong>{r.name}</strong><span>{r.category_name}</span><small>{r.region}{r.contains_egg?' • Egg':''}</small>
      </button>)}</div>}
  </section>;
}

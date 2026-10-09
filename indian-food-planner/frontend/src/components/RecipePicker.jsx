import { useEffect, useState } from 'react';
import api from '../services/api.js';

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
        <strong>{r.name}</strong><span>{r.category_name}</span><small>{r.region}{r.contains_egg?' • Egg':''}</small>
      </button>)}</div>}
  </section>;
}

import { useEffect, useState } from 'react';
import api from '../services/api.js';

function recipeImageUrl(name = '') {
  const tags = String(name).toLowerCase().match(/[a-z0-9]+/g)?.filter(word => !['with', 'and', 'of', 'the', 'a', 'in', 'style', 'homemade', 'traditional'].includes(word)).slice(0, 6).join(',') || 'indian-food';
  const lock = [...String(name)].reduce((sum, char) => sum + char.charCodeAt(0), 1);
  return `https://loremflickr.com/640/480/${tags}?lock=${lock}`;
}
function handleRecipeImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackStep !== '1') {
    image.dataset.fallbackStep = '1';
    image.src = 'https://loremflickr.com/640/480/indian-food?lock=17';
    return;
  }
  image.onerror = null;
  image.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23f7efe3'/%3E%3Cellipse cx='320' cy='205' rx='190' ry='125' fill='white' stroke='%23d8c7b2' stroke-width='12'/%3E%3Cellipse cx='320' cy='205' rx='145' ry='88' fill='%23e8b66d'/%3E%3Ccircle cx='280' cy='180' r='18' fill='%237f9a4a'/%3E%3Ccircle cx='350' cy='220' r='22' fill='%23c45b3a'/%3E%3Ccircle cx='375' cy='170' r='13' fill='%237f9a4a'/%3E%3Cpath d='M250 230 Q310 275 370 225' fill='none' stroke='%23b77835' stroke-width='12' stroke-linecap='round'/%3E%3Ctext x='320' y='365' font-family='Arial,sans-serif' font-size='22' text-anchor='middle' fill='%23715b45'%3EIndian dish%3C/text%3E%3C/svg%3E";
}

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
        <img className="recipe-card-image" src={r.image_url || recipeImageUrl(r.name)} alt={r.name} loading="lazy" onError={handleRecipeImageError} />
        <strong>{r.name}</strong><span>{r.category_name}</span><small>{r.region}{r.contains_egg?' • Egg':''}</small>
      </button>)}</div>}
  </section>;
}

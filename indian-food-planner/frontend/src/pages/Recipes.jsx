import {useEffect,useState} from 'react';
import api from '../services/api.js';
export default function Recipes(){
 const [recipes,setRecipes]=useState([]),[q,setQ]=useState(''),[selected,setSelected]=useState(null);
 useEffect(()=>{api.get('/recipes',{params:{search:q,limit:500}}).then(r=>setRecipes(r.data.recipes))},[q]);
 return <div><div className="page-header"><div><h1>Recipe Master</h1><p>Homemade Indian vegetarian catalog, including egg recipes.</p></div><input className="search-wide" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search recipe or ingredient"/></div>
 <div className="master-grid">{recipes.map(r=><button className="master-card" key={r.id} onClick={()=>setSelected(r)}><strong>{r.name}</strong><span>{r.category_name} · {r.region}</span><small>{r.prep_minutes+r.cook_minutes} min · {r.contains_egg?'Contains egg':'Vegetarian'}</small></button>)}</div>
 {selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><article className="modal recipe-detail" onClick={e=>e.stopPropagation()}><div className="modal-title"><h2>{selected.name}</h2><button onClick={()=>setSelected(null)}>×</button></div><p><b>{selected.category_name}</b> · {selected.region} · {selected.serving_size}</p><h3>Ingredients</h3><p>{selected.ingredients}</p><h3>Preparation</h3><p>{selected.preparation}</p><h3>Timing</h3><p>Prep {selected.prep_minutes} min · Cook {selected.cook_minutes} min</p>{selected.notes&&<p><b>Notes:</b> {selected.notes}</p>}</article></div>}
 </div>
}

import {useEffect,useRef,useState} from 'react';
import api from '../services/api.js';
import { formatIngredients, formatPreparationSteps } from '../utils/recipeFormatting.js';
export default function Recipes(){
 const [recipes,setRecipes]=useState([]),[q,setQ]=useState(''),[selected,setSelected]=useState(null),[isClosing,setIsClosing]=useState(false);
 const closeTimer=useRef(null);
 useEffect(()=>()=>{if(closeTimer.current)clearTimeout(closeTimer.current)},[]);
 const closeSelected=()=>{if(isClosing)return;setIsClosing(true);closeTimer.current=setTimeout(()=>{setSelected(null);setIsClosing(false)},400)};
 const ingredients=selected ? formatIngredients(selected.ingredient_items?.length ? selected.ingredient_items : selected.ingredients) : [];
 const preparationSteps=selected ? formatPreparationSteps(selected.preparation) : [];
 useEffect(()=>{api.get('/recipes',{params:{search:q,vegetarian:'all',limit:500}}).then(r=>setRecipes(r.data.recipes))},[q]);
 return <div><div className="page-header"><div><h1>Recipe Master</h1><p>Homemade Indian vegetarian catalog, including egg recipes.</p></div><input className="search-wide" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search recipe or ingredient"/></div>
 <div className="master-grid">{recipes.map(r=><button className="master-card" key={r.id} onClick={()=>setSelected(r)}>{r.image_url&&<img className="recipe-card-image" src={r.image_url} alt={r.name} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.style.display = 'none'; }}/>}<strong>{r.name}</strong><span>{r.category_name} · {r.region}</span><small>{r.prep_minutes+r.cook_minutes} min · {r.contains_egg?'Contains egg':'Vegetarian'}</small></button>)}</div>
 {selected&&<div className={`modal-backdrop${isClosing?' is-closing':''}`} onClick={closeSelected}><article className={`modal recipe-detail${isClosing?' is-closing':''}`} onClick={e=>e.stopPropagation()}><div className="modal-title"><h2>{selected.name}</h2><button onClick={closeSelected} aria-label="Close recipe details">×</button></div><p><b>{selected.category_name}</b> · {selected.region} · {selected.serving_size}</p>{selected.image_url&&<img className="recipe-detail-image" src={selected.image_url} alt={selected.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.style.display = 'none'; }}/>}<h3>Ingredients</h3>{ingredients.length ? <ul className="recipe-ingredients">{ingredients.map((ingredient,index)=><li key={`${index}-${ingredient}`}>{ingredient}</li>)}</ul> : <p className="recipe-long-text">No ingredients listed.</p>}<h3>Preparation</h3>{preparationSteps.length ? <ol className="recipe-preparation-steps">{preparationSteps.map((step,index)=><li key={`${index}-${step}`}>{step}</li>)}</ol> : <p className="recipe-long-text">No preparation instructions listed.</p>}<h3>Timing</h3><p>Prep {selected.prep_minutes} min · Cook {selected.cook_minutes} min</p>{selected.notes&&<p><b>Notes:</b> {selected.notes}</p>}</article></div>}
 </div>
}

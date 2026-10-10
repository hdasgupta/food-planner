import {useEffect,useRef,useState} from 'react';
import api from '../services/api.js';
import { formatIngredients, formatPreparationSteps } from '../utils/recipeFormatting.js';

function recipeImageUrl(name = '') {
  const tags = String(name).toLowerCase().match(/[a-z0-9]+/g)?.filter(word => !['with', 'and', 'of', 'the', 'a', 'in', 'style', 'homemade', 'traditional'].includes(word)).slice(0, 6).join(',') || 'indian-food';
  const lock = [...String(name)].reduce((sum, char) => sum + char.charCodeAt(0), 1);
  return `https://loremflickr.com/900/640/${tags}?lock=${lock}`;
}
function handleRecipeImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackStep !== '1') {
    image.dataset.fallbackStep = '1';
    image.src = 'https://loremflickr.com/900/640/indian-food?lock=17';
    return;
  }
  image.onerror = null;
  image.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23f7efe3'/%3E%3Cellipse cx='320' cy='205' rx='190' ry='125' fill='white' stroke='%23d8c7b2' stroke-width='12'/%3E%3Cellipse cx='320' cy='205' rx='145' ry='88' fill='%23e8b66d'/%3E%3Ccircle cx='280' cy='180' r='18' fill='%237f9a4a'/%3E%3Ccircle cx='350' cy='220' r='22' fill='%23c45b3a'/%3E%3Ccircle cx='375' cy='170' r='13' fill='%237f9a4a'/%3E%3Cpath d='M250 230 Q310 275 370 225' fill='none' stroke='%23b77835' stroke-width='12' stroke-linecap='round'/%3E%3Ctext x='320' y='365' font-family='Arial,sans-serif' font-size='22' text-anchor='middle' fill='%23715b45'%3EIndian dish%3C/text%3E%3C/svg%3E";
}

export default function Recipes(){
 const [recipes,setRecipes]=useState([]),[q,setQ]=useState(''),[selected,setSelected]=useState(null),[isClosing,setIsClosing]=useState(false);
 const closeTimer=useRef(null);
 useEffect(()=>()=>{if(closeTimer.current)clearTimeout(closeTimer.current)},[]);
 const closeSelected=()=>{if(isClosing)return;setIsClosing(true);closeTimer.current=setTimeout(()=>{setSelected(null);setIsClosing(false)},400)};
 const ingredients=selected ? formatIngredients(selected.ingredient_items?.length ? selected.ingredient_items : selected.ingredients) : [];
 const preparationSteps=selected ? formatPreparationSteps(selected.preparation) : [];
 useEffect(()=>{api.get('/recipes',{params:{search:q,vegetarian:'all',limit:500}}).then(r=>setRecipes(r.data.recipes))},[q]);
 return <div><div className="page-header"><div><h1>Recipe Master</h1><p>Homemade Indian vegetarian catalog, including egg recipes.</p></div><input className="search-wide" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search recipe or ingredient"/></div>
 <div className="master-grid">{recipes.map(r=><button className="master-card" key={r.id} onClick={()=>setSelected(r)}><img className="recipe-card-image" src={r.image_url || recipeImageUrl(r.name)} alt={r.name} loading="lazy" onError={handleRecipeImageError}/><strong>{r.name}</strong><span>{r.category_name} · {r.region}</span><small>{r.prep_minutes+r.cook_minutes} min · {r.contains_egg?'Contains egg':'Vegetarian'}</small></button>)}</div>
 {selected&&<div className={`modal-backdrop${isClosing?' is-closing':''}`} onClick={closeSelected}><article className={`modal recipe-detail${isClosing?' is-closing':''}`} onClick={e=>e.stopPropagation()}><div className="modal-title"><h2>{selected.name}</h2><button onClick={closeSelected} aria-label="Close recipe details">×</button></div><p><b>{selected.category_name}</b> · {selected.region} · {selected.serving_size}</p><img className="recipe-detail-image" src={selected.image_url || recipeImageUrl(selected.name)} alt={selected.name} onError={handleRecipeImageError}/><h3>Ingredients</h3>{ingredients.length ? <ul className="recipe-ingredients">{ingredients.map((ingredient,index)=><li key={`${index}-${ingredient}`}>{ingredient}</li>)}</ul> : <p className="recipe-long-text">No ingredients listed.</p>}<h3>Preparation</h3>{preparationSteps.length ? <ol className="recipe-preparation-steps">{preparationSteps.map((step,index)=><li key={`${index}-${step}`}>{step}</li>)}</ol> : <p className="recipe-long-text">No preparation instructions listed.</p>}<h3>Timing</h3><p>Prep {selected.prep_minutes} min · Cook {selected.cook_minutes} min</p>{selected.notes&&<p><b>Notes:</b> {selected.notes}</p>}</article></div>}
 </div>
}

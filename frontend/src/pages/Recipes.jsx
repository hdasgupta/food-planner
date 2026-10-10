import { useEffect, useState } from 'react';
import api from '../services/api.js';
import RecipeDetailsModal from '../components/RecipeDetailsModal.jsx';

const displayText = value => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(displayText).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const candidate = value.name ?? value.label ?? value.title ?? value.value;
    return candidate == null ? '' : displayText(candidate);
  }
  return '';
};

function dietLabel(recipe) {
  const source = [recipe?.name, recipe?.ingredients, recipe?.ingredient_items]
    .map(displayText).join(' ').toLowerCase();
  if (/\b(prawn|prawns|shrimp|crab|lobster|fish|salmon|tuna|anchov|sardine|mackerel|pomfret|hilsa|rohu|katla|chicken|mutton|lamb|beef|pork|meat|clam|mussel|oyster|squid|octopus)\b/.test(source)) return 'Non-vegetarian';
  if (recipe?.contains_egg === true || recipe?.contains_egg === 1 || ['true', '1', 'yes'].includes(String(recipe?.contains_egg).toLowerCase())) return 'Contains egg';
  return 'Vegetarian';
}

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    api.get('/recipes', { params: { search: q, vegetarian: 'all', limit: 500 } })
      .then(response => {
        if (!active) return;
        const data = response?.data;
        setRecipes(Array.isArray(data?.recipes) ? data.recipes : Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Unable to load recipes:', error);
        if (active) setRecipes([]);
      });
    return () => { active = false; };
  }, [q]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Recipe Master</h1>
          <p>Homemade Indian vegetarian catalog, including egg recipes.</p>
        </div>
        <input className="search-wide" value={q} onChange={event => setQ(event.target.value)} placeholder="Search recipe or ingredient" />
      </div>
      <div className="master-grid">
        {recipes.map((recipe, index) => (
          <button className="master-card" key={recipe.id ?? `${displayText(recipe.name)}-${index}`} type="button" onClick={() => setSelected(recipe)}>
            <strong>{displayText(recipe.name) || 'Unnamed recipe'}</strong>
            <span>{displayText(recipe.category_name ?? recipe.category)} · {displayText(recipe.region)}</span>
            <small>{(Number(recipe.prep_minutes) || 0) + (Number(recipe.cook_minutes) || 0)} min · {dietLabel(recipe)}</small>
          </button>
        ))}
      </div>
      <RecipeDetailsModal recipe={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

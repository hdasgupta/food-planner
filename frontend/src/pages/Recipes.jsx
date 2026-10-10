import { useEffect, useRef, useState } from 'react';
import api from '../services/api.js';
import { formatIngredients, formatPreparationSteps } from '../utils/recipeFormatting.js';

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


const NON_VEGETARIAN_PATTERN = /\b(prawn|prawns|shrimp|crab|lobster|fish|salmon|tuna|anchov(?:y|ies)|sardine|mackerel|hilsa|rohu|katla|tilapia|pomfret|seafood|chicken|mutton|lamb|goat|beef|pork|bacon|ham|meat|duck|turkey|quail|clam|mussel|oyster|squid|octopus)\b/i;

function recipeDietLabel(recipe) {
  // Prefer a clear non-vegetarian label whenever the name or ingredient data
  // identifies meat/seafood, even if the database vegetarian flag is incorrect.
  const source = [
    recipe?.name,
    recipe?.ingredients,
    recipe?.ingredients_original,
    recipe?.ingredient_items,
    recipe?.ingredientItems,
  ].map(value => {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value ?? ''); } catch { return ''; }
  }).join(' ');
  if (NON_VEGETARIAN_PATTERN.test(source)) return 'Non-vegetarian';

  const egg = recipe?.contains_egg === true || recipe?.contains_egg === 1 ||
    ['true', '1', 'yes'].includes(String(recipe?.contains_egg ?? '').toLowerCase());
  return egg ? 'Contains egg' : 'Vegetarian';
}

function safelyFormat(formatter, value) {
  try {
    const result = formatter(value);
    return Array.isArray(result) ? result.map(displayText).filter(Boolean) : [];
  } catch (error) {
    console.error('Unable to format recipe details:', error);
    return [];
  }
}

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

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

  const closeSelected = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimer.current = setTimeout(() => {
      setSelected(null);
      setIsClosing(false);
    }, 400);
  };

  const ingredientSource = selected
    ? (selected.ingredient_items?.length ? selected.ingredient_items : selected.ingredients)
    : [];
  const ingredients = selected ? safelyFormat(formatIngredients, ingredientSource) : [];
  const preparationSteps = selected ? safelyFormat(formatPreparationSteps, selected.preparation) : [];
  const name = displayText(selected?.name) || 'Recipe details';
  const category = displayText(selected?.category_name ?? selected?.category);
  const region = displayText(selected?.region);
  const servingSize = displayText(selected?.serving_size);
  const notes = displayText(selected?.notes);
  const prepMinutes = Number(selected?.prep_minutes) || 0;
  const cookMinutes = Number(selected?.cook_minutes) || 0;

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
          <button className="master-card" key={recipe.id ?? `${displayText(recipe.name)}-${index}`} type="button" onClick={() => { setIsClosing(false); setSelected(recipe); }}>
            <strong>{displayText(recipe.name) || 'Unnamed recipe'}</strong>
            <span>{displayText(recipe.category_name ?? recipe.category)} · {displayText(recipe.region)}</span>
            <small>{(Number(recipe.prep_minutes) || 0) + (Number(recipe.cook_minutes) || 0)} min · {recipeDietLabel(recipe)}</small>
          </button>
        ))}
      </div>
      {selected && (
        <div className={`modal-backdrop${isClosing ? ' is-closing' : ''}`} onClick={closeSelected}>
          <article className={`modal recipe-detail${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label={name} onClick={event => event.stopPropagation()}>
            <div className="modal-title">
              <h2>{name}</h2>
              <button type="button" onClick={closeSelected} aria-label="Close recipe details">×</button>
            </div>
            <p><b>{category}</b>{category && region ? ' · ' : ''}{region}{servingSize ? ` · ${servingSize}` : ''}</p>
            <h3>Ingredients</h3>
            {ingredients.length ? (
              <ul className="recipe-ingredients">{ingredients.map((ingredient, index) => <li key={`${index}-${ingredient}`}>{ingredient}</li>)}</ul>
            ) : <p className="recipe-long-text">No ingredients listed.</p>}
            <h3>Preparation</h3>
            {preparationSteps.length ? (
              <ol className="recipe-preparation-steps">{preparationSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>
            ) : <p className="recipe-long-text">No preparation instructions listed.</p>}
            <h3>Timing</h3>
            <p>Prep {prepMinutes} min · Cook {cookMinutes} min</p>
            {notes && <p><b>Notes:</b> {notes}</p>}
          </article>
        </div>
      )}
    </div>
  );
}

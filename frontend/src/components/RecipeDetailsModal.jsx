import { useEffect, useRef, useState } from 'react';
const QUANTITY_PREFIX = /^\s*((?:about\s+|approximately\s+|approx\.?\s*)?(?:\d+\s*\d\/\d+|\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+(?:[.,]\d+)?|\d+\s*[-–—]\s*\d+(?:\s*[¼½¾⅓⅔⅛⅜⅝⅞])?)(?:\s*[-–—]\s*(?:\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))?\s*(?:cups?|cupfuls?|tbsp|tablespoons?|tsp|teaspoons?|ml|l|litres?|liters?|grams?|g|kg|kilograms?|mg|ounces?|oz|pounds?|lbs?|pieces?|pcs?|cloves?|pinch(?:es)?|bunch(?:es)?|slices?|sprigs?|sticks?|cans?|packets?|medium|large|small)?\b)\s*(.*)$/i;

function parseIngredientLine(value) {
  if (value && typeof value === 'object') {
    let item = String(value.item ?? value.name ?? value.original ?? '').trim();
    let quantity = String(value.quantity ?? value.amount ?? value.qty ?? '').trim();
    let unit = String(value.unit ?? '').trim();
    // Older records sometimes store several semicolon-separated ingredients in one field.
    if (item && /[;\n]/.test(item)) return splitIngredientText(item).map(entry => ({ ...entry, original: value.original || '' }));
    if (!quantity && item) {
      const match = item.match(QUANTITY_PREFIX);
      if (match && match[2]) { quantity = match[1].trim(); item = match[2].trim(); }
    }
    return [{ item, quantity, unit, original: value.original || '' }];
  }
  return splitIngredientText(String(value ?? '').trim());
}

function splitIngredientText(text) {
  // Split the source delimiters first, then separate quantity-prefixed entries.
  const segments = String(text || '').split(/[;\n]+/).map(part => part.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, '')).filter(Boolean);
  const parsed = [];
  for (const segment of segments) {
    const match = segment.match(QUANTITY_PREFIX);
    if (match && match[2]) {
      parsed.push({ item: match[2].trim(), quantity: match[1].trim(), unit: '', original: segment });
    } else if (parsed.length) {
      // Descriptions like "thinly sliced" are continuations of the preceding ingredient.
      parsed[parsed.length - 1].item = `${parsed[parsed.length - 1].item.replace(/[,:;\s]+$/, '')}, ${segment}`;
    } else {
      parsed.push({ item: segment, quantity: '', unit: '', original: segment });
    }
  }
  return parsed;
}

function formatIngredients(value) {
  let parsed = value;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { return splitIngredientText(parsed); }
  }
  if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
    parsed = Object.entries(parsed).map(([key, entry]) => entry && typeof entry === 'object' ? { item: entry.item ?? entry.name ?? key, ...entry } : { item: key, quantity: entry });
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap(parseIngredientLine).filter(item => item.item || item.quantity || item.unit);
}

function formatPreparationSteps(value) {
  if (value == null || value === '') return [];
  let parsed = value;
  if (typeof parsed === 'string') {
    const text = parsed.trim();
    if (!text) return [];
    // Some records store preparation as a JSON array/object string.
    if ((text.startsWith('[') && text.endsWith(']')) || (text.startsWith('{') && text.endsWith('}'))) {
      try { parsed = JSON.parse(text); } catch { parsed = text; }
    }
  }
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    parsed = Object.entries(parsed).map(([key, step]) => {
      if (step && typeof step === 'object') return step.instruction ?? step.text ?? step.step ?? '';
      return typeof step === 'string' ? step : `${key}. ${step}`;
    });
  }
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  const steps = entries.flatMap(entry => {
    const text = typeof entry === 'string' ? entry : String(entry?.instruction ?? entry?.text ?? entry?.step ?? '');
    // Split numbered steps even when the database stored the whole recipe on one line.
    return text.replace(/\r/g, '').split(/\n+/).flatMap(line => {
      const cleaned = line.trim();
      if (!cleaned) return [];
      const parts = cleaned.split(/(?<!^)(?=\s+\d+[.)]\s+(?:\(\s*\d+\s*min\s*\)\s*)?[A-Z])/);
      return parts.map(part => part.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
    });
  });
  return steps;
}

function fallbackFoodImage(name = '') { const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, ',').replace(/^,|,$/g, ''); const lock = [...String(name)].reduce((sum, char) => sum + char.charCodeAt(0), 0); return `https://loremflickr.com/900/640/indian-food,${slug}?lock=${lock}`; }

export default function RecipeDetailsModal({ recipe, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef(null);
  useEffect(() => { setIsClosing(false); return () => { if (closeTimer.current) clearTimeout(closeTimer.current); }; }, [recipe]);
  const closeWithAnimation = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimer.current = setTimeout(onClose, 400);
  };
  if (!recipe) return null;
  const ingredients = formatIngredients(recipe.ingredient_items?.length ? recipe.ingredient_items : recipe.ingredients);
  const preparationSteps = formatPreparationSteps(recipe.preparation);

  return <div className={`modal-backdrop${isClosing ? ' is-closing' : ''}`} onClick={closeWithAnimation}>
    <article className={`modal recipe-detail${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title"
      onClick={event => event.stopPropagation()}>
      <div className="modal-title">
        <div>
          <h2 id="recipe-detail-title">{recipe.name}</h2>
          <p className="recipe-subtitle">{recipe.category_name || recipe.category} · {recipe.region || 'Indian home cooking'}</p>
        </div>
        <button type="button" onClick={closeWithAnimation} aria-label="Close recipe details">×</button>
      </div>
      {recipe.image_url && <img className="recipe-detail-image" src={recipe.image_url} alt={recipe.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.style.display = 'none'; }} />}
      <div className="recipe-meta">
        <span>{/prawn|shrimp|fish|seafood|chicken|mutton|lamb|beef|pork|crab|lobster|meat/i.test([recipe.name, recipe.ingredients, JSON.stringify(recipe.ingredient_items || [])].join(' ')) ? 'Non-vegetarian' : recipe.contains_egg ? 'Contains egg' : 'Vegetarian'}</span>
        <span>{recipe.serving_size || '2 servings'}</span>
        <span>{Number(recipe.prep_minutes || 0) + Number(recipe.cook_minutes || 0)} min total</span>
      </div>
      <h3>Ingredients</h3>
      {ingredients.length > 0 ? (
        <ul className="recipe-ingredients">
          {ingredients.map((ingredient, index) => <li className="ingredient-row" key={`${index}-${ingredient.item}-${ingredient.quantity}`}><span className="ingredient-name">{ingredient.item || ingredient.original}</span>{(ingredient.quantity || ingredient.unit) && <span className="ingredient-amount">{[ingredient.quantity, ingredient.unit].filter(Boolean).join(' ')}</span>}</li>)}
        </ul>
      ) : <p className="recipe-long-text">No ingredients listed.</p>}
      <h3>Preparation</h3>
      {preparationSteps.length > 0 ? (
        <ol className="recipe-preparation-steps">
          {preparationSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
        </ol>
      ) : <p className="recipe-long-text">No preparation instructions listed.</p>}
      {recipe.notes && <><h3>Notes</h3><p className="recipe-long-text">{recipe.notes}</p></>}
    </article>
  </div>;
}

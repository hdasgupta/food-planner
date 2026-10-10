import { useEffect, useRef, useState } from 'react';
const QUANTITY_PREFIX = /^\s*((?:about\s+|approximately\s+|approx\.?\s*)?(?:\d+\s*\d\/\d+|\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+(?:[.,]\d+)?|\d+\s*[-–—]\s*\d+(?:\s*[¼½¾⅓⅔⅛⅜⅝⅞])?)(?:\s*[-–—]\s*(?:\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))?\s*(?:cups?|cupfuls?|tbsp|tablespoons?|tsp|teaspoons?|ml|l|litres?|liters?|grams?|g|kg|kilograms?|mg|ounces?|oz|pounds?|lbs?|pieces?|pcs?|cloves?|pinch(?:es)?|bunch(?:es)?|slices?|sprigs?|sticks?|cans?|packets?|medium|large|small)?\b)\s*(.*)$/i;

function parseIngredientLine(value) {
  if (value && typeof value === 'object') {
    let item = String(value.item ?? value.name ?? value.original ?? '').trim();
    let quantity = String(value.quantity ?? '').trim();
    let unit = String(value.unit ?? '').trim();
    // Older records sometimes stored the complete line in `item` and left quantity blank.
    if (!quantity && item) {
      const match = item.match(QUANTITY_PREFIX);
      if (match && match[2]) {
        quantity = match[1].trim();
        item = match[2].trim();
      }
    }
    return { item, quantity, unit, original: value.original || '' };
  }
  const original = String(value ?? '').trim();
  const match = original.match(QUANTITY_PREFIX);
  if (match && match[2]) return { item: match[2].trim(), quantity: match[1].trim(), unit: '', original };
  return { item: original, quantity: '', unit: '', original };
}

function formatIngredients(value) {
  let parsed = value;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { parsed = parsed.split(/\n+|\s*;\s*/).filter(Boolean); }
  }
  if (!Array.isArray(parsed)) {
    if (parsed && typeof parsed === 'object') parsed = Object.entries(parsed).map(([item, quantity]) => ({ item, quantity: typeof quantity === 'object' ? quantity?.quantity : quantity, ...(typeof quantity === 'object' ? quantity : {}) }));
    else return [];
  }
  // Some legacy recipe records contain multiple semicolon-separated ingredients
  // in one item. Split those lines before parsing each quantity independently.
  return parsed.flatMap(entry => {
    if (entry && typeof entry === 'object') {
      const item = String(entry.item ?? entry.name ?? entry.original ?? '').trim();
      const quantity = String(entry.quantity ?? '').trim();
      const unit = String(entry.unit ?? '').trim();
      if (!quantity && !unit && item.includes(';')) {
        return item.split(/\s*;\s*/).filter(Boolean).map(parseIngredientLine);
      }
      return [parseIngredientLine(entry)];
    }
    return String(entry ?? '').split(/\s*;\s*/).filter(Boolean).map(parseIngredientLine);
  }).filter(item => item.item || item.quantity || item.unit);
}

function isNonVegetarian(recipe) {
  // Database/API values can arrive as booleans, numbers, or strings such as "false"/"0".
  const flag = recipe?.is_vegetarian;
  if (flag === false || flag === 0 || /^(false|0|no|non.?vegetarian|nonveg)$/i.test(String(flag ?? '').trim())) return true;

  // Always prioritize the dish name and all ingredient representations over a stale
  // vegetarian flag. This catches seafood/meat recipes even when the DB flag is wrong.
  const ingredientText = value => {
    if (value == null) return '';
    if (typeof value === 'string') {
      try { return ingredientText(JSON.parse(value)); } catch { return value; }
    }
    if (Array.isArray(value)) return value.map(ingredientText).join(' ');
    if (typeof value === 'object') return Object.values(value).map(ingredientText).join(' ');
    return String(value);
  };
  const text = [
    recipe?.name,
    recipe?.category,
    recipe?.category_name,
    recipe?.ingredients,
    recipe?.ingredient_items,
    recipe?.ingredients_original,
  ].map(ingredientText).join(' ').toLowerCase();
  return /\b(prawn|shrimp|fish|salmon|tuna|crab|lobster|seafood|anchov(?:y|ies)|chicken|mutton|lamb|beef|pork|duck|keema|meat|bacon|ham|turkey|goat)\b/.test(text);
}

function formatPreparationSteps(value) {
  if (value == null || value === '') return [];

  let steps = value;
  if (typeof steps === 'string') {
    const raw = steps.trim();
    try {
      const decoded = JSON.parse(raw);
      if (Array.isArray(decoded) || (decoded && typeof decoded === 'object')) steps = decoded;
    } catch { /* Plain text instructions are handled below. */ }
  }

  if (Array.isArray(steps)) {
    const normalized = steps.map(step => {
      if (typeof step === 'string' || typeof step === 'number') return String(step).trim();
      if (step && typeof step === 'object') {
        return String(step.instruction ?? step.step ?? step.description ?? step.text ?? '').trim();
      }
      return '';
    }).filter(Boolean);
    // A single array entry may itself contain several numbered instructions.
    if (normalized.length > 1 || !normalized[0]) {
      return normalized.flatMap(splitNumberedInstructions);
    }
    return splitNumberedInstructions(normalized[0]);
  }

  if (steps && typeof steps === 'object') {
    const ordered = Object.keys(steps).sort((a, b) => Number(a) - Number(b));
    return ordered.map(key => steps[key]).flatMap(step => formatPreparationSteps(step));
  }

  return splitNumberedInstructions(String(steps));
}

function splitNumberedInstructions(text) {
  const normalized = String(text ?? '').replace(/\r/g, '').trim();
  if (!normalized) return [];
  // Split only at explicit step markers, not ordinary line wrapping/newlines.
  const marked = normalized.replace(/\n+\s*(?=\d{1,2}[.)]\s)/g, ' ');
  const parts = marked.split(/(?<!^)(?=\s+\d{1,2}[.)]\s)/).map(part =>
    part.replace(/^\s*\d{1,2}[.)]\s*/, '').replace(/\s+/g, ' ').trim()
  ).filter(Boolean);
  return parts.length ? parts : [normalized.replace(/\s+/g, ' ')];
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
        <span>{isNonVegetarian(recipe) ? 'Non-vegetarian' : recipe.contains_egg ? 'Contains egg' : 'Vegetarian'}</span>
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

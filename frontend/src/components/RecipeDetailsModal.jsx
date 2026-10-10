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
  if (recipe.is_vegetarian === false) return true;
  const text = `${recipe.name || ''} ${Array.isArray(recipe.ingredients) ? recipe.ingredients.map(item => typeof item === 'string' ? item : `${item?.item || ''} ${item?.original || ''}`).join(' ') : recipe.ingredients || ''}`.toLowerCase();
  return /\b(prawn|shrimp|fish|salmon|tuna|crab|lobster|meat|chicken|mutton|lamb|beef|pork|duck|keema|anchov(?:y|ies))\b/.test(text);
}

function formatPreparationSteps(value) {
  if (Array.isArray(value)) return value.map(step => String(step).trim()).filter(Boolean);
  if (value == null || value === '') return [];
  return String(value).split(/\n+/).map(step => step.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
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

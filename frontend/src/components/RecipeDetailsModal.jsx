import { useEffect, useRef, useState } from 'react';
import { formatIngredients, formatPreparationSteps } from '../utils/recipeFormatting.js';

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
      <div className="recipe-meta">
        <span>{recipe.contains_egg ? 'Contains egg' : 'Vegetarian'}</span>
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

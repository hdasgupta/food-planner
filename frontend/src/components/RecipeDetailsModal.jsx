import { useEffect, useRef, useState } from 'react';
import { formatIngredients, formatPreparationSteps } from '../utils/recipeFormatting.js';

const FOOD_IMAGES = ['photo-1546069901-ba9599a7e63c','photo-1540189549336-e6e99c3679fe','photo-1512621776951-a57141f2eefd','photo-1512621776951-a57141f2eefd','photo-1547592180-85f173990554','photo-1476224203421-9ac39bcb3327','photo-1565299624946-b28f40a0ae38','photo-1565299507177-b0ac66763828'];
function fallbackFoodImage(name = '') { const hash = [...String(name)].reduce((sum, char) => sum + char.charCodeAt(0), 0); return `https://images.unsplash.com/${FOOD_IMAGES[hash % FOOD_IMAGES.length]}?auto=format&fit=crop&w=900&q=80`; }

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
      {recipe.image_url && <img className="recipe-detail-image" src={recipe.image_url} alt={recipe.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackFoodImage(recipe.name); }} />}
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

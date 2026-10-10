import { useEffect, useRef, useState } from 'react';
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
      <img className="recipe-detail-image" src={recipe.image_url || recipeImageUrl(recipe.name)} alt={recipe.name} onError={handleRecipeImageError} />
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

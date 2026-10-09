import { useEffect, useMemo, useRef, useState } from 'react';
import { MEALS } from './MealSlot.jsx';

export default function EditMenuItemModal({ item, categories, recipes, items = [], onClose, onSave }) {
  const initialCategory = categories.find(category => category.name === item.category);
  const [mealSlot, setMealSlot] = useState(item.mealSlot || 'breakfast');
  const [categoryId, setCategoryId] = useState(initialCategory ? String(initialCategory.id) : '');
  const [recipeId, setRecipeId] = useState(String(item.recipeId));
  const [quantity, setQuantity] = useState(String(item.quantity ?? 1));
  const [unit, setUnit] = useState(item.unit || 'serving');
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const closeWithAnimation = callback => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimer.current = setTimeout(() => callback(), 400);
  };
  const availableRecipes = useMemo(
    () => recipes.filter(recipe => !categoryId || String(recipe.category_id) === categoryId),
    [recipes, categoryId]
  );

  const submit = event => {
    event.preventDefault();
    const recipe = availableRecipes.find(candidate => String(candidate.id) === recipeId);
    const amount = Number(quantity);
    if (!recipe) return setError('Please select a recipe.');
    const currentKey = String(item.id ?? item._key);
    const duplicate = items.some(candidate =>
      String(candidate.id ?? candidate._key) !== currentKey &&
      candidate.mealSlot === mealSlot &&
      String(candidate.recipeId) === String(recipe.id)
    );
    if (duplicate) return setError('That recipe is already in the selected meal timing.');
    if (!Number.isFinite(amount) || amount <= 0) return setError('Quantity must be greater than zero.');
    if (!unit.trim()) return setError('Please enter a unit.');
    closeWithAnimation(() => onSave({ mealSlot, recipe, quantity: amount, unit: unit.trim() }));
  };

  return <div className={`modal-backdrop${isClosing ? ' is-closing' : ''}`} onClick={() => closeWithAnimation(onClose)}>
    <form className={`modal edit-menu-modal${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="edit-menu-title"
      onSubmit={submit} onClick={event => event.stopPropagation()}>
      <div className="modal-title"><h2 id="edit-menu-title">Edit planned food</h2>
        <button type="button" onClick={() => closeWithAnimation(onClose)} aria-label="Close editor">×</button></div>
      <div className="edit-form-grid">
        <label>Food timing
          <select value={mealSlot} onChange={event => setMealSlot(event.target.value)}>
            {MEALS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label>Food type
          <select value={categoryId} onChange={event => { setCategoryId(event.target.value); setRecipeId(''); }}>
            <option value="">All food types</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="wide-field">Recipe
          <select value={recipeId} onChange={event => setRecipeId(event.target.value)} required>
            <option value="">Select a recipe</option>
            {availableRecipes.map(recipe => <option key={recipe.id} value={recipe.id}>
              {recipe.name}{recipe.contains_egg ? ' · Egg' : ''}
            </option>)}
          </select>
        </label>
        <label>Quantity
          <input type="number" min="0.01" step="0.01" value={quantity} onChange={event => setQuantity(event.target.value)} required />
        </label>
        <label>Unit
          <input value={unit} onChange={event => setUnit(event.target.value)} placeholder="serving, piece, cup…" required />
        </label>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="modal-footer">
        <button type="button" className="secondary" onClick={() => closeWithAnimation(onClose)}>Cancel</button>
        <button type="submit" className="primary">Save changes</button>
      </div>
    </form>
  </div>;
}

import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api.js';
import MealSlot, { MEALS } from '../components/MealSlot.jsx';
import RecipeDetailsModal from '../components/RecipeDetailsModal.jsx';
import EditMenuItemModal from '../components/EditMenuItemModal.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function itemKey(item) {
  return String(item.id ?? item._key);
}

function serializePlan(plan) {
  return {
    notes: plan.notes || '',
    items: plan.items.map(({ mealSlot, recipeId, quantity, unit }) => ({
      mealSlot,
      recipeId,
      quantity,
      unit
    }))
  };
}

export default function Planner() {
  const [date, setDate] = useState(today);
  const [planDate, setPlanDate] = useState('');
  const [plan, setPlan] = useState({ items: [], notes: '' });
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [mealSlot, setMealSlot] = useState('breakfast');
  const [categoryId, setCategoryId] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [quantity, setQuantity] = useState(() => localStorage.getItem('foodPlannerLastQuantity') || '1');
  const [unit, setUnit] = useState(() => localStorage.getItem('foodPlannerLastUnit') || 'serving');
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const savedNotes = useRef('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/recipes/categories'),
      api.get('/recipes', { params: { vegetarian: 'all', limit: 500 } })
    ]).then(([categoryResponse, recipeResponse]) => {
      if (!active) return;
      setCategories(categoryResponse.data.categories || []);
      setRecipes(recipeResponse.data.recipes || []);
    }).catch(requestError => {
      if (active) setError(requestError.response?.data?.error || 'Could not load the recipe catalog.');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingPlan(true);
    setError('');
    setMessage('');
    setEditingItem(null);
    setViewingRecipe(null);
    setPlanDate('');
    setPlan({ items: [], notes: '' });
    api.get(`/plans/${date}`).then(response => {
      if (!active) return;
      const loadedPlan = { ...response.data.plan, items: response.data.plan.items || [] };
      savedNotes.current = loadedPlan.notes || '';
      setPlan(loadedPlan);
      setPlanDate(date);
    }).catch(requestError => {
      if (active) setError(requestError.response?.data?.error || 'Could not load the menu for this date.');
    }).finally(() => {
      if (active) setLoadingPlan(false);
    });
    return () => { active = false; };
  }, [date]);

  const grouped = useMemo(() => Object.fromEntries(
    MEALS.map(([key]) => [key, plan.items.filter(item => item.mealSlot === key)])
  ), [plan.items]);

  const filteredRecipes = useMemo(() => {
    const term = recipeSearch.trim().toLowerCase();
    return recipes.filter(recipe =>
      (!categoryId || String(recipe.category_id) === categoryId) &&
      (!term || recipe.name.toLowerCase().includes(term) || String(recipe.ingredients || '').toLowerCase().includes(term))
    );
  }, [recipes, categoryId, recipeSearch]);
  const selectedRecipe = recipes.find(recipe => String(recipe.id) === recipeId);
  const selectedDateLabel = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const changeDateBy = (days) => {
    const nextDate = new Date(`${date}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + days);
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    setDate(`${year}-${month}-${day}`);
  };
  const maxMealCount = Math.max(1, ...MEALS.map(([key]) => grouped[key].length));

  const persist = async (nextPlan, successMessage = 'Menu saved.') => {
    if (planDate !== date || loadingPlan) {
      setError('Wait until the selected date menu has finished loading before saving.');
      return;
    }
    const savingDate = date;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await api.put(`/plans/${savingDate}`, serializePlan(nextPlan));
      if (savingDate === date) {
        const savedPlan = { ...response.data.plan, items: response.data.plan.items || [] };
        savedNotes.current = savedPlan.notes || '';
        setPlan(savedPlan);
        setPlanDate(savingDate);
      }
      setMessage(successMessage);
    } catch (requestError) {
      // Keep the user's edit in the interface so they can retry saving it.
      if (savingDate === date) setPlan(nextPlan);
      setError(requestError.response?.data?.error || 'Could not save the menu. Your changes are still on screen.');
    } finally {
      setBusy(false);
    }
  };

  const addFood = async event => {
    event.preventDefault();
    setError('');
    if (loadingPlan) {
      setError('Wait for the selected date menu to finish loading.');
      return;
    }
    if (!selectedRecipe) {
      setError('Select a food type and recipe before adding food.');
      return;
    }
    if (plan.items.some(item => item.mealSlot === mealSlot && String(item.recipeId) === String(selectedRecipe.id))) {
      setError('That recipe is already in this meal timing.');
      return;
    }
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }
    if (!unit.trim()) {
      setError('Enter a unit for the quantity.');
      return;
    }
    const normalizedUnit = unit.trim();
    localStorage.setItem('foodPlannerLastQuantity', String(amount));
    localStorage.setItem('foodPlannerLastUnit', normalizedUnit);
    const nextPlan = {
      ...plan,
      items: [...plan.items, {
        _key: `new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        mealSlot,
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        category: selectedRecipe.category_name,
        quantity: amount,
        unit: normalizedUnit
      }]
    };
    await persist(nextPlan, `${selectedRecipe.name} added to ${MEALS.find(([key]) => key === mealSlot)?.[1]}.`);
    setRecipeId('');
  };

  const removeFood = item => setConfirmingRemoval(item);

  const confirmRemoveFood = async () => {
    if (!confirmingRemoval) return;
    const item = confirmingRemoval;
    setConfirmingRemoval(null);
    const nextPlan = { ...plan, items: plan.items.filter(candidate => itemKey(candidate) !== itemKey(item)) };
    await persist(nextPlan, `${item.recipeName} removed from the menu.`);
  };

  const saveEditedFood = async changes => {
    localStorage.setItem('foodPlannerLastQuantity', String(changes.quantity));
    localStorage.setItem('foodPlannerLastUnit', changes.unit);
    setQuantity(String(changes.quantity));
    setUnit(changes.unit);
    const updatedItem = {
      ...editingItem,
      mealSlot: changes.mealSlot,
      recipeId: changes.recipe.id,
      recipeName: changes.recipe.name,
      category: changes.recipe.category_name,
      quantity: changes.quantity,
      unit: changes.unit
    };
    const nextPlan = {
      ...plan,
      items: plan.items.map(item => itemKey(item) === itemKey(editingItem) ? updatedItem : item)
    };
    setEditingItem(null);
    await persist(nextPlan, `${changes.recipe.name} updated.`);
  };

  const showRecipe = item => {
    const recipe = recipes.find(candidate => String(candidate.id) === String(item.recipeId));
    if (recipe) setViewingRecipe(recipe);
    else api.get(`/recipes/${item.recipeId}`).then(response => setViewingRecipe(response.data.recipe))
      .catch(requestError => setError(requestError.response?.data?.error || 'Could not load recipe details.'));
  };

  // Notes are saved automatically after the user pauses typing. Menu item
  // additions, edits and removals already persist immediately.
  useEffect(() => {
    if (loadingPlan || planDate !== date || (plan.notes || '') === savedNotes.current) return;
    const notesToSave = plan.notes || '';
    const timer = setTimeout(() => {
      persist(plan, 'Notes saved automatically.');
    }, 700);
    return () => clearTimeout(timer);
  }, [plan.notes, date, planDate, loadingPlan]);

  return <div>
    <div className="page-header">
      <div><h1>Daily Food Planner</h1><p>Plan homemade Indian food from breakfast to dinner.</p></div>
      <div className="date-actions" style={{ alignItems: 'center' }}>
        <button
          type="button"
          className="icon-button"
          aria-label="Previous day"
          title="Previous day"
          onClick={() => changeDateBy(-1)}
          disabled={busy || loadingPlan}
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <label className="date-field">Menu date
          <input aria-label="Menu date" type="date" value={date} onChange={event => setDate(event.target.value)} disabled={busy} />
          <span className="selected-date-label">{selectedDateLabel}</span>
        </label>
        <button
          type="button"
          className="icon-button"
          aria-label="Next day"
          title="Next day"
          onClick={() => changeDateBy(1)}
          disabled={busy || loadingPlan}
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>

    <section className="add-menu-panel">
      <div className="add-menu-heading">
        <div><h2>Add food to this date</h2><p>Select the timing, food type and recipe.</p></div>
        <span className="catalog-count">{recipes.length} recipes loaded</span>
      </div>
      <form className="menu-form-row" onSubmit={addFood}>
        <label>Food timing
          <select value={mealSlot} onChange={event => setMealSlot(event.target.value)} disabled={busy}>
            {MEALS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label>Food type
          <select value={categoryId} onChange={event => { setCategoryId(event.target.value); setRecipeId(''); }} disabled={busy}>
            <option value="">All food types</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="recipe-select-field">Recipe
          <div className="recipe-input-stack">
            <input type="search" value={recipeSearch} onChange={event => { setRecipeSearch(event.target.value); setRecipeId(''); }}
              placeholder="Search recipe or ingredient" aria-label="Search recipes or ingredients" disabled={busy} />
            <select value={recipeId} onChange={event => setRecipeId(event.target.value)} disabled={busy || recipes.length === 0} required>
            <option value="">Select a recipe</option>
            {filteredRecipes.map(recipe => <option key={recipe.id} value={recipe.id}>
              {recipe.name}{recipe.contains_egg ? ' · Egg' : ''}
            </option>)}
            </select>
          </div>
        </label>
        <label>Quantity
          <input type="number" min="0.01" step="any" value={quantity}
            onChange={event => setQuantity(event.target.value)} disabled={busy} required />
        </label>
        <label>Unit
          <input type="text" value={unit} onChange={event => setUnit(event.target.value)}
            placeholder="serving, bowl, piece…" disabled={busy} required />
        </label>
        <button className="primary add-menu-button" type="submit" disabled={busy || loadingPlan || !selectedRecipe}>
          <span aria-hidden="true">＋</span> Add food
        </button>
      </form>
    </section>

    <StatusMessage error={error} success={message}
      confirmation={confirmingRemoval ? `${confirmingRemoval.recipeName} from the menu for ${selectedDateLabel}` : null}
      onConfirm={confirmRemoveFood} onCancel={() => setConfirmingRemoval(null)} />


    {loadingPlan ? <div className="loading">Loading menu…</div> :
      <div className="planner-grid">
        {MEALS.map(([key, title]) => <div key={key}>
          <MealSlot title={title} items={grouped[key]} onEdit={setEditingItem} onRemove={removeFood}
            onShowRecipe={showRecipe} disabled={busy} />
        </div>)}
      </div>}

    <label className="notes"><span>Notes for this day</span>
      <textarea value={plan.notes || ''} onChange={event => setPlan(current => ({ ...current, notes: event.target.value }))}
        placeholder="Guests, leftovers, fasting day, special preparation…" disabled={busy || loadingPlan} />
    </label>

    {editingItem && <EditMenuItemModal item={editingItem} items={plan.items} categories={categories} recipes={recipes}
      onClose={() => setEditingItem(null)} onSave={saveEditedFood} />}
    <RecipeDetailsModal recipe={viewingRecipe} onClose={() => setViewingRecipe(null)} />
  </div>;
}

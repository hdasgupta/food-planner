export default function RecipeCard({ recipe }) {
  return (
    <article className="recipe-card">
      <div className="recipe-title-row">
        <h3>{recipe.name}</h3>
        {recipe.is_egg && <span className="badge egg">Egg</span>}
      </div>
      <div className="muted">{recipe.category_name} · {recipe.prep_minutes + recipe.cook_minutes} min · serves {recipe.servings}</div>
      <h4>Ingredients</h4>
      <ul>{(recipe.ingredients || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
      <h4>Preparation</h4>
      <ol>{(recipe.instructions || []).map((x, i) => <li key={i}>{x}</li>)}</ol>
    </article>
  );
}

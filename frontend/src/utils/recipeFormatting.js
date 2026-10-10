function parseSerialized(value) {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!text) return '';
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const INGREDIENT_PREFIX = /^\s*((?:about\s+|approximately\s+|approx\.?\s*)?(?:\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+(?:[.,]\d+)?)(?:\s*[-–—]\s*(?:\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))?\s*(?:cups?|cupfuls?|tbsp|tablespoons?|tsp|teaspoons?|ml|lit(?:re|er)s?|grams?|g|kg|kilograms?|mg|ounces?|oz|pounds?|lbs?|pieces?|pcs?|cloves?|pinch(?:es)?|bunch(?:es)?|slices?|sprigs?|sticks?|cans?|packets?|medium|large|small)?\b)\s*(.*)$/i;

function ingredientText(value) {
  if (value == null) return { item: '', quantity: '', unit: '', original: '' };
  let name, quantity, unit, original;
  if (typeof value === 'object') {
    name = String(value.item ?? value.name ?? value.ingredient ?? value.title ?? '').trim();
    quantity = String(value.quantity ?? value.amount ?? value.qty ?? '').trim();
    unit = String(value.unit ?? '').trim();
    original = String(value.original ?? [quantity, unit, name].filter(Boolean).join(' ')).trim();
  } else {
    name = String(value).trim(); quantity = ''; unit = ''; original = name;
  }
  // Older catalog/database rows may store the whole line in `item`/`name`.
  if (!quantity && name) {
    const match = name.match(INGREDIENT_PREFIX);
    if (match && match[2]) {
      quantity = match[1].trim();
      name = match[2].trim();
    }
  }
  return { item: name, quantity, unit, original };
}
export function formatIngredients(value) {
  const parsed = parseSerialized(value);
  if (parsed == null || parsed === '') return [];
  let values;
  if (Array.isArray(parsed)) values = parsed;
  else if (typeof parsed === 'object') values = Object.entries(parsed).map(([key, item]) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) return { item: item.item ?? item.name ?? key, ...item };
    return { item: key, quantity: item, original: `${key}: ${item}` };
  });
  else values = String(parsed).split(/\n+|\s*;\s*|\s*,\s*/).map(item => item.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, '')).filter(Boolean);
  return values.map(ingredientText).filter(item => item.item || item.quantity || item.original);
}

export function formatPreparationSteps(value) {
  const parsed = parseSerialized(value);
  if (parsed == null || parsed === '') return [];

  let rawSteps;
  if (Array.isArray(parsed)) {
    rawSteps = parsed;
  } else if (typeof parsed === 'object') {
    rawSteps = Object.values(parsed);
  } else {
    const text = String(parsed).trim();
    // Support both numbered steps on separate lines and inline sequences such as "1. Mix. 2. Cook.".
    rawSteps = text
      .split(/\n+/)
      .flatMap(line => line.trim().split(/\s+(?=\d+[.)]\s+)/))
      .filter(Boolean);
  }

  return rawSteps.map(step => {
    let text = typeof step === 'object' && step !== null
      ? String(step.instruction ?? step.step ?? step.text ?? ingredientText(step))
      : String(step);
    return text.trim().replace(/^(?:(?:step\s*)?\d+[.)]|[-*•])\s*/i, '').trim();
  }).filter(Boolean);
}

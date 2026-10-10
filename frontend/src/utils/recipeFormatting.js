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

const QUANTITY_PREFIX = /^\s*((?:(?:about|approximately|approx\.?|around)\s+)?(?:\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+(?:[.,]\d+)?)(?:\s*(?:-|–|—|to)\s*(?:\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))?\s*(?:cups?|cupfuls?|tbsp|tablespoons?|tsp|teaspoons?|ml|l|lit(?:re|er)s?|grams?|g|kg|kilograms?|mg|ounces?|oz|pounds?|lbs?|pieces?|pcs?|cloves?|pinches?|bunches?|slices?|sprigs?|sticks?|cans?|packets?|medium|large|small|handfuls?)?\b)\s*(.*)$/i;

function splitQuantity(itemName, quantity = '', unit = '', original = '') {
  let item = String(itemName ?? '').trim();
  let amount = String(quantity ?? '').trim();
  let measure = String(unit ?? '').trim();
  // Legacy records sometimes store the full line in item/name and leave quantity/unit blank.
  if (item && !amount && !measure) {
    const match = item.match(QUANTITY_PREFIX);
    if (match && match[2] && /\S/.test(match[2])) {
      amount = match[1].trim();
      item = match[2].trim().replace(/^[:\-–—]+\s*/, '');
    }
  }
  return { item, quantity: amount, unit: measure, original: String(original || [amount, measure, item].filter(Boolean).join(' ')).trim() };
}

function ingredientText(value) {
  if (value == null) return splitQuantity('');
  if (typeof value !== 'object') {
    const original = String(value).trim();
    return splitQuantity(original, '', '', original);
  }
  const name = value.item ?? value.name ?? value.ingredient ?? value.title ?? value.original ?? '';
  const quantity = value.quantity ?? value.amount ?? value.qty ?? '';
  const unit = value.unit ?? '';
  return splitQuantity(name, quantity, unit, value.original ?? '');
}

export function formatIngredients(value) {
  const parsed = parseSerialized(value);
  if (parsed == null || parsed === '') return [];
  let values;
  if (Array.isArray(parsed)) values = parsed;
  else if (typeof parsed === 'object') values = Object.entries(parsed).map(([key, item]) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) return { ...item, item: item.item ?? item.name ?? key };
    return { item: key, quantity: item, original: `${key}: ${item}` };
  });
  else values = String(parsed).split(/\n+|\s*;\s*/).map(item => item.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, '')).filter(Boolean);
  return values.map(ingredientText).filter(item => item.item || item.quantity || item.unit || item.original);
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

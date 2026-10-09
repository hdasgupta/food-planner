# Recipe seeding strategy

The bundled dataset is a curated starter catalogue generated from common Indian dish knowledge rather than copied recipe prose from a third-party site.

For a production-grade "huge and complete" catalogue, use a recipe source whose license explicitly permits database redistribution and commercial use. Map that source into the normalized fields used by `recipes`:

- `name`
- `category`
- `cuisine_region`
- `meal_tags`
- `is_vegetarian`
- `contains_egg`
- `ingredients`
- `preparation`
- `prep_minutes`
- `cook_minutes`
- `servings`
- `source`

Keep the source attribution in the `source` field and retain any required license/attribution metadata in a future `recipe_sources` table.

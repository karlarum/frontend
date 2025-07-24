export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  category: string;
}

export class Recipe {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public ingredients: Ingredient[],
    public instructions: string[],
    public imageUrl: string = '',
  ) {}

  getIngredientsByCategory(category: string): Ingredient[] {
    return this.ingredients.filter(ingredient => ingredient.category === category);
  }
}
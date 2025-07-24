import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe, Ingredient } from '../recipes/recipe.model';

interface ShoppingItem {
  name: string;
  amount: string;
  unit: string;
  fromRecipe: string;
}

@Component({
  selector: 'rp-shopping-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.scss'
})
export class ShoppingListComponent {
  shoppingItems: ShoppingItem[] = [];
  currentWeekPlans: any[] = [];

  itemToDeleteIndex: number | null = null;
  showDeleteConfirm = false;

  constructor() {
    this.loadMealPlans();
    this.loadCustomShoppingItems();
    this.generateShoppingList();
  }

  loadMealPlans() {
    const saved = sessionStorage.getItem('mealPlan');
    if (saved) {
      const mealPlan = JSON.parse(saved);
      this.currentWeekPlans = [];
      
      mealPlan.forEach((day: any) => {
        if (day.meals && day.meals.length > 0) {
          day.meals.forEach((meal: any) => {
            this.currentWeekPlans.push({
              day: day.day,
              recipe: this.createRecipeFromMealData(meal)
            });
          });
        }
      });
    } else {
      this.loadSampleMealPlans();
    }
  }

  loadSampleMealPlans() {
    const sampleRecipes = [
      new Recipe('1', 'Spaghetti Carbonara', 'Classic Italian pasta dish', [
        { name: 'spaghetti', amount: '1', unit: 'lb', category: 'pasta' },
        { name: 'eggs', amount: '4', unit: 'large', category: 'dairy' },
        { name: 'parmesan cheese', amount: '1', unit: 'cup', category: 'dairy' },
        { name: 'pancetta', amount: '4', unit: 'oz', category: 'meat' }
      ], ['Boil pasta', 'Cook pancetta', 'Mix with eggs']),
      new Recipe('2', 'Chicken Stir Fry', 'Quick healthy stir fry', [
        { name: 'chicken breast', amount: '1', unit: 'lb', category: 'meat' },
        { name: 'broccoli', amount: '2', unit: 'cups', category: 'vegetables' },
        { name: 'soy sauce', amount: '3', unit: 'tbsp', category: 'condiments' },
        { name: 'garlic', amount: '3', unit: 'cloves', category: 'vegetables' }
      ], ['Cut chicken', 'Heat oil', 'Stir fry']),
      new Recipe('3', 'Caesar Salad', 'Fresh crispy salad', [
        { name: 'romaine lettuce', amount: '1', unit: 'head', category: 'vegetables' },
        { name: 'parmesan cheese', amount: '0.5', unit: 'cup', category: 'dairy' },
        { name: 'croutons', amount: '1', unit: 'cup', category: 'bread' },
        { name: 'caesar dressing', amount: '0.25', unit: 'cup', category: 'condiments' }
      ], ['Wash lettuce', 'Make dressing', 'Toss together'])
    ];

    this.currentWeekPlans = [
      { day: 'Monday', recipe: sampleRecipes[0] },
      { day: 'Wednesday', recipe: sampleRecipes[1] },
      { day: 'Friday', recipe: sampleRecipes[2] },
      { day: 'Saturday', recipe: sampleRecipes[0] }
    ];
  }

  loadCustomShoppingItems() {
    const saved = sessionStorage.getItem('customShoppingList');
    if (saved) {
      // Handled in generateShoppingList
    }
  }

  createRecipeFromMealData(mealData: any): Recipe {
    return new Recipe(
      mealData.id,
      mealData.title,
      mealData.description || 'Planned meal',
      [],
      []
    );
  }

  generateShoppingList() {
    const ingredientMap = new Map<string, ShoppingItem>();

    this.currentWeekPlans.forEach(plan => {
      if (plan.recipe.ingredients && plan.recipe.ingredients.length > 0) {
        plan.recipe.ingredients.forEach((ingredient: Ingredient) => {
          const key = ingredient.name.toLowerCase();

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.amount = `${existing.amount} + ${ingredient.amount}`;
            existing.fromRecipe = `${existing.fromRecipe}, ${plan.recipe.title}`;
          } else {
            ingredientMap.set(key, {
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
              fromRecipe: plan.recipe.title
            });
          }
        });
      }
    });

    const customItems = sessionStorage.getItem('customShoppingList');
    if (customItems) {
      const items = JSON.parse(customItems);
      items.forEach((item: ShoppingItem) => {
        const key = item.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.amount = `${existing.amount} + ${item.amount}`;
          existing.fromRecipe = `${existing.fromRecipe}, ${item.fromRecipe}`;
        } else {
          ingredientMap.set(key, item);
        }
      });
    }

    this.shoppingItems = Array.from(ingredientMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  onDeleteClick(index: number, event: Event) {
    //Added error handling because I kept running into many issues
    console.log('Delete clicked for index:', index);
    console.log('Item to delete:', this.shoppingItems[index]);
    
    event.stopPropagation();
    event.preventDefault();
    
    this.itemToDeleteIndex = index;
    this.showDeleteConfirm = true;
    
    console.log('Modal should show:', this.showDeleteConfirm);
    console.log('Item index to delete:', this.itemToDeleteIndex);
  }

  confirmDelete(confirm: boolean) {
    console.log('Confirm delete called with:', confirm);
    console.log('Item to delete index:', this.itemToDeleteIndex);
    
    if (confirm && this.itemToDeleteIndex !== null) {
      const itemToDelete = this.shoppingItems[this.itemToDeleteIndex];
      console.log('Deleting item:', itemToDelete);

      this.shoppingItems.splice(this.itemToDeleteIndex, 1);
      
      this.updateSessionStorageAfterDelete(itemToDelete);
      
      console.log('Items remaining:', this.shoppingItems.length);
    }
    
    this.itemToDeleteIndex = null;
    this.showDeleteConfirm = false;
    
    console.log('Modal closed, showDeleteConfirm:', this.showDeleteConfirm);
  }

  private updateSessionStorageAfterDelete(deletedItem: ShoppingItem) {
    const customItems = sessionStorage.getItem('customShoppingList');
    if (customItems) {
      const items = JSON.parse(customItems);
      const updatedItems = items.filter((item: ShoppingItem) => 
        item.name.toLowerCase() !== deletedItem.name.toLowerCase()
      );
      sessionStorage.setItem('customShoppingList', JSON.stringify(updatedItems));
    }
  }

  getTotalItems(): number {
    return this.shoppingItems.length;
  }

  getPlannedMealsCount(): number {
    return this.currentWeekPlans.length;
  }
}
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../recipe.model';
import { RecipeEditComponent } from '../recipe-edit/recipe-edit';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'rp-recipe-detail',
  standalone: true,
  imports: [CommonModule, RecipeEditComponent],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss'
})
export class RecipeDetailComponent {
  @Input() recipe: Recipe | null = null;
  @Output() recipeDeleted = new EventEmitter<string>();
  @Output() addToMealPlan = new EventEmitter<Recipe>();
  @Output() addToShoppingList = new EventEmitter<Recipe>();

  showEditForm = false;
  showDeleteConfirm = false;
  showShoppingListDialog = false;
  showSuccessMessage = false;
  successMessage = '';

  constructor(private recipeService: RecipeService) {}

  onEditRecipe(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.showEditForm = true;
  }

  onRecipeSaved(savedRecipe: Recipe) {
    if (this.recipe) {
      this.recipeService.updateRecipe(this.recipe, savedRecipe)
        .subscribe({
          next: (updatedRecipe) => {
            console.log('Recipe updated successfully:', updatedRecipe);
            this.recipe = updatedRecipe;
            this.showEditForm = false;
            this.successMessage = `"${updatedRecipe.title}" has been updated successfully!`;
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 3000);
          },
          error: (error) => {
            console.error('Error updating recipe:', error);
            this.successMessage = 'Error updating recipe. Please try again.';
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 3000);
          }
        });
    }
  }

  onEditCancelled() {
    this.showEditForm = false;
  }

  onDeleteRecipe() {
    this.confirmDelete();
  }

  onAddToMealPlan() {
    if (this.recipe) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayChoice = prompt(
        `Add "${this.recipe.title}" to which day?\n\nEnter:\n1 - Monday\n2 - Tuesday\n3 - Wednesday\n4 - Thursday\n5 - Friday\n6 - Saturday\n7 - Sunday`
      );
      
      if (dayChoice && dayChoice.trim()) {
        const dayIndex = parseInt(dayChoice.trim()) - 1;
        if (dayIndex >= 0 && dayIndex < 7) {
          const selectedDay = days[dayIndex];
          this.addRecipeToMealPlan(selectedDay, this.recipe);
          alert(`"${this.recipe.title}" has been added to ${selectedDay}!`);
        } else {
          alert('Please enter a number between 1 and 7');
        }
      }
    }
  }

  onAddToShoppingList() {
    if (this.recipe) {
      this.showShoppingListDialog = true;
    }
  }

  onShoppingListConfirmed(confirmed: boolean) {
    this.showShoppingListDialog = false;
    if (confirmed && this.recipe) {
      this.addIngredientsToShoppingList(this.recipe);

      this.successMessage = `${this.recipe.ingredients.length} ingredients from "${this.recipe.title}" have been added to your shopping list!`;
      this.showSuccessMessage = true;

      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  }

  private addRecipeToMealPlan(day: string, recipe: Recipe) {
    let mealPlan = [];
    const saved = sessionStorage.getItem('mealPlan');
    if (saved) {
      mealPlan = JSON.parse(saved);
    } else {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      mealPlan = days.map(d => ({ day: d, meals: [] }));
    }

    const dayObj = mealPlan.find((d: any) => d.day === day);
    if (dayObj) {
      if (!dayObj.meals.find((m: any) => m.id === recipe.id)) {
        dayObj.meals.push({
          id: recipe.id,
          title: recipe.title,
          description: recipe.description
        });
      }
    }

    sessionStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  }

  confirmDelete() {
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(confirmed: boolean) {
    this.showDeleteConfirm = false;
    if (confirmed && this.recipe) {
      this.recipeService.deleteRecipe(this.recipe)
        .subscribe({
          next: () => {
            console.log('Recipe deleted successfully');
            this.recipeDeleted.emit(this.recipe!.id);
            
            this.successMessage = `"${this.recipe!.title}" has been deleted successfully!`;
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 3000);
          },
          error: (error) => {
            console.error('Error deleting recipe:', error);
            this.successMessage = 'Error deleting recipe. Please try again.';
            this.showSuccessMessage = true;
            setTimeout(() => {
              this.showSuccessMessage = false;
            }, 3000);
          }
        });
    }
  }

  private addIngredientsToShoppingList(recipe: Recipe) {
    let shoppingList = [];
    const saved = sessionStorage.getItem('customShoppingList');
    if (saved) {
      shoppingList = JSON.parse(saved);
    }

    recipe.ingredients.forEach(ingredient => {
      const existingItem = shoppingList.find((item: any) => 
        item.name.toLowerCase() === ingredient.name.toLowerCase()
      );

      if (existingItem) {
        existingItem.amount = `${existingItem.amount} + ${ingredient.amount}`;
        existingItem.fromRecipe = `${existingItem.fromRecipe}, ${recipe.title}`;
      } else {
        shoppingList.push({
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          fromRecipe: recipe.title
        });
      }
    });

    sessionStorage.setItem('customShoppingList', JSON.stringify(shoppingList));
  }
}
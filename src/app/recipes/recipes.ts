import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeListComponent } from './recipe-list/recipe-list';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail';
import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'rp-recipes',
  standalone: true,
  imports: [CommonModule, RecipeListComponent, RecipeDetailComponent],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss'
})
export class RecipesComponent {
  selectedRecipe: Recipe | null = null;

  constructor(private recipeService: RecipeService) {}

  onRecipeSelected(recipe: Recipe) {
    this.selectedRecipe = recipe;
  }

  onRecipeDeleted(recipeId: string) {
    const recipeToDelete = this.recipeService.getRecipe(recipeId);
    if (recipeToDelete) {
      this.recipeService.deleteRecipe(recipeToDelete);
      
      if (this.selectedRecipe && this.selectedRecipe.id === recipeId) {
        this.selectedRecipe = null;
      }
    }
  }
}
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { RecipeEditComponent } from '../recipe-edit/recipe-edit';

@Component({
  selector: 'rp-recipe-list',
  standalone: true,
  imports: [CommonModule, RecipeEditComponent],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss'
})
export class RecipeListComponent implements OnInit, OnDestroy {
  @Output() recipeWasSelected = new EventEmitter<Recipe>();
  
  recipes: Recipe[] = [];
  private subscription!: Subscription;
  showNewRecipeDialog = false;
  showSuccessMessage = false;
  successMessage = '';

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.subscription = this.recipeService.recipeListChangedEvent.subscribe(
      (recipesList: Recipe[]) => {
        this.recipes = recipesList;
      }
    );
    
    this.recipeService.recipes$.subscribe(
      (recipesList: Recipe[]) => {
        this.recipes = recipesList;
      }
    );
    
    this.recipes = this.recipeService.getRecipes();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onRecipeSelected(recipe: Recipe) {
    this.recipeWasSelected.emit(recipe);
  }

  onNewRecipe() {
    this.showNewRecipeDialog = true;
  }

  onNewRecipeSaved(newRecipe: Recipe) {
    console.log('Saving new recipe:', newRecipe);
    
    this.recipeService.addRecipe(newRecipe)
      .subscribe({
        next: (savedRecipe) => {
          console.log('Recipe saved successfully:', savedRecipe);
          this.showNewRecipeDialog = false;
          
          this.successMessage = `"${savedRecipe.title}" has been added successfully!`;
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);

          this.recipeWasSelected.emit(savedRecipe);
        },
        error: (error) => {
          console.error('Error saving recipe:', error);
          this.successMessage = 'Error saving recipe. Please try again.';
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        }
      });
  }

  onNewRecipeCancelled() {
    console.log('New recipe cancelled');
    this.showNewRecipeDialog = false;
  }
}
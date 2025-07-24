import { Routes } from '@angular/router';
import { RecipesComponent } from './recipes/recipes';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit';
import { MealPlanComponent } from './meal-plan/meal-plan';
import { ShoppingListComponent } from './shopping-list/shopping-list';

export const routes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  { path: 'recipes', component: RecipesComponent },
  { path: 'recipes/new', component: RecipeEditComponent },
  { path: 'recipes/:id/edit', component: RecipeEditComponent },
  { path: 'meal-plan', component: MealPlanComponent },
  { path: 'shopping-list', component: ShoppingListComponent },
  { path: '**', redirectTo: '/recipes' }
];

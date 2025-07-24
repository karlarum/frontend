import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Recipe, Ingredient } from './recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly apiUrl = 'http://localhost:3000/api/recipes';
  
  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  public recipes$ = this.recipesSubject.asObservable();
  
  recipeListChangedEvent = new Subject<Recipe[]>();

  constructor(private http: HttpClient) {
    this.loadRecipes();
  }

  /* Load recipes from backend */
  private loadRecipes(): void {
    this.http.get<Recipe[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe({
        next: (recipes) => {
          console.log('Loaded recipes from backend:', recipes);
          this.recipesSubject.next(recipes);
          this.recipeListChangedEvent.next(recipes);
        },
        error: (error) => {
          console.error('Error loading recipes:', error);
          this.loadSampleData();
        }
      });
  }

  private loadSampleData(): void {
    const sampleRecipes: Recipe[] = [
      new Recipe(
        '1',
        'Spaghetti Carbonara',
        'Classic Italian pasta dish with eggs, cheese, and pancetta',
        [
          { name: 'spaghetti', amount: '1', unit: 'lb', category: 'pasta' },
          { name: 'eggs', amount: '4', unit: 'large', category: 'dairy' },
          { name: 'parmesan cheese', amount: '1', unit: 'cup', category: 'dairy' },
          { name: 'pancetta', amount: '4', unit: 'oz', category: 'meat' },
          { name: 'black pepper', amount: '1', unit: 'tsp', category: 'spices' }
        ],
        [
          'Boil pasta according to package directions',
          'Cook pancetta until crispy in a large skillet',
          'Beat eggs with cheese and pepper in a bowl',
          'Drain pasta and immediately combine with egg mixture',
          'Add pancetta and toss quickly',
          'Serve immediately with extra cheese'
        ],
        'assets/images/carbonara.webp'
      ),
      new Recipe(
        '2',
        'Chocolate Chip Cookies',
        'Soft and chewy homemade chocolate chip cookies',
        [
          { name: 'all-purpose flour', amount: '2.25', unit: 'cups', category: 'dry goods' },
          { name: 'butter', amount: '1', unit: 'cup', category: 'dairy' },
          { name: 'brown sugar', amount: '0.75', unit: 'cup', category: 'dry goods' },
          { name: 'white sugar', amount: '0.25', unit: 'cup', category: 'dry goods' },
          { name: 'eggs', amount: '2', unit: 'large', category: 'dairy' },
          { name: 'chocolate chips', amount: '2', unit: 'cups', category: 'baking' }
        ],
        [
          'Preheat oven to 375°F (190°C)',
          'Cream butter and both sugars until light and fluffy',
          'Beat in eggs one at a time, then vanilla',
          'Mix in flour gradually',
          'Fold in chocolate chips',
          'Bake for 9-11 minutes until golden brown'
        ],
        'assets/images/cookies.webp'
      ),
      new Recipe(
        '3',
        'Chicken Stir Fry',
        'Quick and healthy chicken stir fry with fresh vegetables',
        [
          { name: 'chicken breast', amount: '1', unit: 'lb', category: 'meat' },
          { name: 'broccoli', amount: '2', unit: 'cups', category: 'vegetables' },
          { name: 'bell peppers', amount: '2', unit: 'medium', category: 'vegetables' },
          { name: 'soy sauce', amount: '3', unit: 'tbsp', category: 'condiments' }
        ],
        [
          'Cut chicken into bite-sized pieces',
          'Heat oil in large wok or skillet over high heat',
          'Add chicken and cook for 5-6 minutes until golden',
          'Add vegetables and stir-fry for 3-4 minutes',
          'Add soy sauce and toss everything together',
          'Serve immediately over rice'
        ],
        'assets/images/stir-fry.webp'
      )
    ];
    
    this.recipesSubject.next(sampleRecipes);
    this.recipeListChangedEvent.next(sampleRecipes);
  }

  getRecipes(): Recipe[] {
    return this.recipesSubject.value;
  }

  getRecipes$(): Observable<Recipe[]> {
    return this.recipes$;
  }

  getRecipe(id: string): Recipe | undefined {
    return this.recipesSubject.value.find(recipe => recipe.id === id);
  }

  getRecipe$(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  addRecipe(newRecipe: Recipe): Observable<Recipe> {
    const recipeData = {
      title: newRecipe.title,
      description: newRecipe.description,
      ingredients: newRecipe.ingredients,
      instructions: newRecipe.instructions,
      imageUrl: newRecipe.imageUrl || '',
      prepTime: 30,
      cookTime: 30, 
      servings: 4,
      category: 'main dish',
      difficulty: 'medium'
    };

    return this.http.post<Recipe>(this.apiUrl, recipeData)
      .pipe(
        tap(recipe => {
          console.log('Recipe added:', recipe);
          const currentRecipes = this.recipesSubject.value;
          const updatedRecipes = [...currentRecipes, recipe];
          this.recipesSubject.next(updatedRecipes);
          this.recipeListChangedEvent.next(updatedRecipes);
        }),
        catchError(this.handleError)
      );
  }

  updateRecipe(originalRecipe: Recipe, newRecipe: Recipe): Observable<Recipe> {
    const recipeData = {
      title: newRecipe.title,
      description: newRecipe.description,
      ingredients: newRecipe.ingredients,
      instructions: newRecipe.instructions,
      imageUrl: newRecipe.imageUrl || '',
      prepTime: 30,
      cookTime: 30,
      servings: 4,
      category: 'main dish',
      difficulty: 'medium'
    };

    return this.http.put<Recipe>(`${this.apiUrl}/${originalRecipe.id}`, recipeData)
      .pipe(
        tap(updatedRecipe => {
          console.log('Recipe updated:', updatedRecipe);
          const currentRecipes = this.recipesSubject.value;
          const index = currentRecipes.findIndex(r => r.id === originalRecipe.id);
          if (index !== -1) {
            currentRecipes[index] = updatedRecipe;
            this.recipesSubject.next([...currentRecipes]);
            this.recipeListChangedEvent.next([...currentRecipes]);
          }
        }),
        catchError(this.handleError)
      );
  }


  deleteRecipe(recipe: Recipe): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${recipe.id}`)
      .pipe(
        tap(() => {
          console.log('Recipe deleted:', recipe.id);
          const currentRecipes = this.recipesSubject.value;
          const updatedRecipes = currentRecipes.filter(r => r.id !== recipe.id);
          this.recipesSubject.next(updatedRecipes);
          this.recipeListChangedEvent.next(updatedRecipes);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    
    if (error.status === 0) {
      console.error('Network error:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
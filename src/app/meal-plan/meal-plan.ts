import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../recipes/recipe.model';

interface DayMeals {
  day: string;
  date: Date;
  meals: Recipe[];
}

@Component({
  selector: 'rp-meal-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-plan.html',
  styleUrl: './meal-plan.scss'
})
export class MealPlanComponent {
  currentWeek: Date = new Date();
  weekDays: DayMeals[] = [];
  showRecipeModal = false;
  selectedDay: string = '';
  availableRecipes: Recipe[] = [];

  constructor() {
    this.loadSavedMealPlan();
    this.initializeWeek();
    this.loadAvailableRecipes();
  }

  initializeWeek() {
    const startOfWeek = this.getStartOfWeek(this.currentWeek);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    this.weekDays = dayNames.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      return {
        day: day,
        date: date,
        meals: this.getSavedMealsForDay(day) || []
      };
    });
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  loadAvailableRecipes() {
  this.availableRecipes = [
    new Recipe(
      '1',
      'Spaghetti Carbonara',
      'Classic Italian pasta dish',
      [
        { name: 'spaghetti', amount: '1', unit: 'lb', category: 'pasta' },
        { name: 'eggs', amount: '4', unit: 'large', category: 'dairy' }
      ],
      ['Boil pasta', 'Cook pancetta', 'Mix with eggs'],
      'assets/images/carbonara.webp' // Add image URL
    ),
    new Recipe(
      '2',
      'Chicken Stir Fry',
      'Quick healthy stir fry',
      [
        { name: 'chicken breast', amount: '1', unit: 'lb', category: 'meat' },
        { name: 'broccoli', amount: '2', unit: 'cups', category: 'vegetables' }
      ],
      ['Cut chicken', 'Heat oil', 'Stir fry'],
      'assets/images/stir-fry.webp' // Add image URL
    ),
    new Recipe(
      '3',
      'Caesar Salad',
      'Fresh crispy salad',
      [
        { name: 'romaine lettuce', amount: '1', unit: 'head', category: 'vegetables' },
        { name: 'parmesan cheese', amount: '0.5', unit: 'cup', category: 'dairy' }
      ],
      ['Wash lettuce', 'Make dressing', 'Toss together'],
      'assets/images/cookies.webp' // Add image URL (or create a salad image)
    )
  ];
}

  openRecipeModal(day: string) {
    this.selectedDay = day;
    this.showRecipeModal = true;
  }

  closeRecipeModal() {
    this.showRecipeModal = false;
    this.selectedDay = '';
  }

  addRecipeToDay(recipe: Recipe) {
    const dayObj = this.weekDays.find(d => d.day === this.selectedDay);
    if (dayObj) {
      if (!dayObj.meals.find(m => m.id === recipe.id)) {
        dayObj.meals.push(recipe);
        this.saveMealPlan(); 
      }
    }
    this.closeRecipeModal();
    return false;
  }

  removeRecipeFromDay(day: string, recipeId: string) {
    const dayObj = this.weekDays.find(d => d.day === day);
    if (dayObj) {
      dayObj.meals = dayObj.meals.filter(m => m.id !== recipeId);
      this.saveMealPlan();
    }
  }

  previousWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() - 7);
    this.initializeWeek();
  }

  nextWeek() {
    this.currentWeek.setDate(this.currentWeek.getDate() + 7);
    this.initializeWeek();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getWeekRange(): string {
    const start = this.weekDays[0]?.date;
    const end = this.weekDays[6]?.date;
    if (start && end) {
      return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    }
    return '';
  }

  private saveMealPlan() {
    const mealPlanData = this.weekDays.map(day => ({
      day: day.day,
      meals: day.meals.map(meal => ({
        id: meal.id,
        title: meal.title,
        description: meal.description
      }))
    }));
    if (typeof(Storage) !== "undefined") {
      sessionStorage.setItem('mealPlan', JSON.stringify(mealPlanData));
    }
  }

  private loadSavedMealPlan() {
    if (typeof(Storage) !== "undefined") {
      const saved = sessionStorage.getItem('mealPlan');
      if (saved) {
        this.savedMealPlan = JSON.parse(saved);
      }
    }
  }

  private getSavedMealsForDay(day: string): Recipe[] {
    if (!this.savedMealPlan) return [];
    const dayData = this.savedMealPlan.find((d: any) => d.day === day);
    if (!dayData) return [];
    
    return dayData.meals.map((meal: any) => {
      const fullRecipe = this.availableRecipes.find(r => r.id === meal.id);
      return fullRecipe || new Recipe(
        meal.id, meal.title, meal.description, [], []
      );
    });
  }

  private savedMealPlan: any = null;
}
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'rp-recipe-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-edit.html',
  styleUrl: './recipe-edit.scss'
})
export class RecipeEditComponent implements OnInit {
  @Input() originalRecipe: Recipe | null = null;
  @Output() recipeSaved = new EventEmitter<Recipe>();
  @Output() cancelEdit = new EventEmitter<void>();
  
  recipe: Recipe = new Recipe('', '', '', [], [], '');
  editMode: boolean = false;

  ngOnInit(): void {
    console.log('RecipeEditComponent initialized');
    console.log('Original recipe:', this.originalRecipe);
    
    if (this.originalRecipe) {
      this.editMode = true;
      this.recipe = new Recipe(
        this.originalRecipe.id,
        this.originalRecipe.title,
        this.originalRecipe.description,
        [...this.originalRecipe.ingredients], 
        [...this.originalRecipe.instructions], 
        this.originalRecipe.imageUrl
      );
      console.log('Edit mode - cloned recipe:', this.recipe);
    } else {
      this.editMode = false;
      this.recipe = new Recipe('', '', '', [], [], '');
      console.log('Add mode - new recipe:', this.recipe);
    }
  }

  onSubmit(form: NgForm) {
    console.log('Form submitted');
    console.log('Form valid:', form.valid);
    console.log('Form value:', form.value);
    
    if (form.valid) {
      const value = form.value;
      
      const newRecipe = new Recipe(
        this.editMode ? this.originalRecipe!.id : '',
        value.title,
        value.description,
        this.recipe.ingredients, 
        this.recipe.instructions, 
        value.imageUrl || ''
      );

      console.log('Emitting saved recipe:', newRecipe);
      this.recipeSaved.emit(newRecipe);
    } else {
      console.log('Form is invalid');
    }
  }

  onCancel() {
    console.log('Edit cancelled');
    this.cancelEdit.emit();
  }
}
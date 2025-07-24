import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ShoppingItem {
  id: number;
  name: string;
  amount: string;
  unit: string;
  fromRecipe: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private shoppingItems: ShoppingItem[] = [];
  private maxId = 0;

  private shoppingItemsSubject = new BehaviorSubject<ShoppingItem[]>([]);
  shoppingItems$ = this.shoppingItemsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const data = sessionStorage.getItem('customShoppingList');
    if (data) {
      this.shoppingItems = JSON.parse(data);
      this.maxId = this.getMaxId();
      this.emitChanges();
    }
  }

  private saveToStorage() {
    sessionStorage.setItem('customShoppingList', JSON.stringify(this.shoppingItems));
  }

  private getMaxId(): number {
    let maxId = 0;
    this.shoppingItems.forEach(item => {
      if (item.id > maxId) maxId = item.id;
    });
    return maxId;
  }

  private emitChanges() {
    this.shoppingItemsSubject.next([...this.shoppingItems]);
  }

  getItems(): ShoppingItem[] {
    return [...this.shoppingItems];
  }

  addItem(item: Omit<ShoppingItem, 'id'>) {
    this.maxId++;
    const newItem: ShoppingItem = { ...item, id: this.maxId };
    this.shoppingItems.push(newItem);
    this.saveToStorage();
    this.emitChanges();
  }

  updateItem(updatedItem: ShoppingItem) {
    const index = this.shoppingItems.findIndex(i => i.id === updatedItem.id);
    if (index > -1) {
      this.shoppingItems[index] = updatedItem;
      this.saveToStorage();
      this.emitChanges();
    }
  }

  deleteItem(id: number) {
    const index = this.shoppingItems.findIndex(i => i.id === id);
    if (index > -1) {
      this.shoppingItems.splice(index, 1);
      this.saveToStorage();
      this.emitChanges();
    }
  }
}

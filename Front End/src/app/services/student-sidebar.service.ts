import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentSidebarService {
  private isOpenSubject = new BehaviorSubject<boolean>(true);
  isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  open(): void {
    this.isOpenSubject.next(true);
  }

  close(): void {
    this.isOpenSubject.next(false);
  }
}
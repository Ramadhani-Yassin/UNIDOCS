import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://10.177.46.248:8088/api/users'; // Use your actual API URL
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize with user from localStorage if available
    this.loadStoredUser();
  }

  // Register new user
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  // User login
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Student login (only students allowed)
  studentLogin(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/student-login`, credentials);
  }

  // Store user data in localStorage and BehaviorSubject
  public storeUserData(user: any): void {
    if (!user) {
      console.warn('Attempted to store null/undefined user in localStorage!');
      return;
    }
    console.log('Storing user in localStorage:', user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Get currently logged in user
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  // Fetch user by ID from backend
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Update user profile
  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData).pipe(
      tap(updatedUser => {
        if (updatedUser) {
          this.storeUserData(updatedUser);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Logout user
  logout(): void {
    console.log('Removing currentUser from localStorage');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  // Get student count
  getStudentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count-students`);
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  // Load user from localStorage on service initialization
  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    console.log('Loaded user from localStorage on init:', storedUser);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }
}
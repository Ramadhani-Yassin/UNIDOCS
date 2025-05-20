import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8088/api/users'; // Adjust port if needed

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: { email: string, password: string, role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      email: credentials.email,
      password: credentials.password,
      role: credentials.role
    }).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      })
    );
  }
}
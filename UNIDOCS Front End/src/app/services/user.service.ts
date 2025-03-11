// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BackendConfigService } from './backend-config.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private backendConfigService: BackendConfigService
  ) {}

  // Get the base API URL from the backend configuration service
  private get apiUrl(): string {
    return `${this.backendConfigService.getBackendUrl()}/api/users`;
  }

  // Signup (Create User)
  signup(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  // Login
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  // Get User Details
  getUserDetails(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/details`, credentials);
  }

  // Other methods as needed
}
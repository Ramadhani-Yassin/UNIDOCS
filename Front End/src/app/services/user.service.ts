import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { BackendConfigService } from './backend-config.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private backendConfigService: BackendConfigService
  ) {}

  private get apiUrl(): string {
    return `${this.backendConfigService.getBackendUrl()}/api/users`;
  }

  signup(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
        email: credentials.email,
        password: credentials.password
    });
}

  getUserDetails(credentials: {
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/details`, credentials);
  }
}

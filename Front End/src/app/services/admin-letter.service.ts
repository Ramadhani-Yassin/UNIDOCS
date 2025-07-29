import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service'; // Import UserService

@Injectable({
  providedIn: 'root'
})
export class AdminLetterService {
  private apiUrl = 'http://localhost:8088/api/letter-requests';

  constructor(private http: HttpClient, private userService: UserService) {}

  updateStatus(id: string, status: string, adminComment: string) {
    const user = this.userService.getCurrentUser();
    const headers = new HttpHeaders({
      'X-User-Role': user?.role || 'admin'
    });
    return this.http.put(`${this.apiUrl}/${id}/status`, { status, adminComment }, { headers });
  }

  getTotalLettersGenerated() {
    return this.http.get<number>(`${this.apiUrl}/count-all`);
  }

  getGeneratedLetter(id: string, format: 'pdf' | 'docx' = 'pdf') {
    return this.http.get(
      `${this.apiUrl}/${id}/generate?format=${format}`,
      { responseType: 'blob' }
    );
  }

  getAll() {
    return this.http.get<any[]>('http://localhost:8088/api/letter-requests');
  }
}
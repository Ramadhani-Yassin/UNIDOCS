import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminLetterService {
  private apiUrl = 'http://localhost:8088/api/letter-requests'; // <-- Use your backend URL

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  updateStatus(id: string, status: string, adminComment: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status, adminComment });
  }

  getTotalLettersGenerated(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count-all`);
  }

  getGeneratedLetter(id: string, format: 'pdf' | 'docx' = 'pdf'): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${id}/generate?format=${format}`,
      { responseType: 'blob' }
    );
  }

}
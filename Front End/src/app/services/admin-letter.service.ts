import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminLetterService {
  private apiUrl = 'http://192.168.106.248:8088/api/admin/letters';

  constructor(private http: HttpClient) {}

  updateStatus(id: string, status: string, comment: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status, comment });
  }

  getAll() {
    return this.http.get<any[]>(this.apiUrl);
  }
}
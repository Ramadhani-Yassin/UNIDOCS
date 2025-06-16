import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Announcement } from '../models/announcement.model';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private apiUrl = `${environment.apiUrl}/api/announcements`;

  constructor(private http: HttpClient) {}

  createAnnouncement(formData: FormData): Observable<any> {
    return this.http.post('/api/announcements', formData);
  }

  createAnnouncementJson(announcement: any): Observable<any> {
    return this.http.post(this.apiUrl, announcement);
  }

  getRecentAnnouncements(limit: number = 5): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  getAnnouncementById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}/${id}`);
  }

  getAllAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(this.apiUrl);
  }

  getAnnouncementCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
}
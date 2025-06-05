import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

export interface CVRequest {
    id: string;
    fullName: string;
    email: string;
    registrationNumber: string;
    phoneNumber: string;
    programOfStudy: string;
    yearOfStudy: number;
    cvTemplate: string;
    // Add other fields as needed
}

@Injectable({
    providedIn: 'root'
})
export class CVRequestService {
    private apiUrl = `${environment.apiUrl}/api/cv-requests`;

    constructor(
        private http: HttpClient,
        private userService: UserService
    ) { }

    submitCVRequest(requestData: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
        });

        return this.http.post(this.apiUrl, this.formatRequestData(requestData), { headers })
            .pipe(
                catchError(this.handleError)
            );
    }

    getRecentCVRequests(limit: number = 5): Observable<CVRequest[]> {
        const user = this.userService.getCurrentUser();
        if (!user || !user.email) {
            return throwError(() => new Error('User email not available'));
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getAuthToken()}`
        });
        
        return this.http.get<CVRequest[]>(
            `${this.apiUrl}/recent/${encodeURIComponent(user.email)}?limit=${limit}`, 
            { headers }
        ).pipe(
            catchError(this.handleError)
        );
    }

    getCVRequestCount(): Observable<number> {
        const user = this.userService.getCurrentUser();
        if (!user || !user.email) {
            return throwError(() => new Error('User email not available'));
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getAuthToken()}`
        });
        
        return this.http.get<number>(`${this.apiUrl}/count/${encodeURIComponent(user.email)}`, { headers })
            .pipe(
                catchError(this.handleError)
            );
    }

    getCVRequestById(id: string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getAuthToken()}`
        });

        return this.http.get(`${this.apiUrl}/${id}`, { headers })
            .pipe(
                catchError(this.handleError)
            );
    }

    private formatRequestData(request: any): any {
        return {
            fullName: request.fullName,
            email: request.email,
            registrationNumber: request.registrationNumber,
            phoneNumber: request.phoneNumber,
            programOfStudy: request.programOfStudy,
            yearOfStudy: request.yearOfStudy,
            cvTemplate: request.cvTemplate,
            // Add other fields as needed
        };
    }

    private getAuthToken(): string {
        return localStorage.getItem('auth_token') || '';
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'An unknown error occurred';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            if (error.error && error.error.message) {
                errorMessage = error.error.message;
            } else if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
            }
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
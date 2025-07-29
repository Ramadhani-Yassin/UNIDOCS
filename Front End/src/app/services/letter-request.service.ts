import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

export interface LetterRequest {
    id: string;
    letterType: string;
    status: string;
    requestDate?: string;
    adminComment?: string; // <-- Add this line
    // Add other fields as needed
}

@Injectable({
    providedIn: 'root'
})
export class LetterRequestService {
    private apiUrl = `${environment.apiUrl}/api/letter-requests`;

    constructor(
        private http: HttpClient,
        private userService: UserService
    ) { }

    submitLetterRequest(requestData: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.post(this.apiUrl, this.formatRequestData(requestData), { headers })
            .pipe(
                catchError(this.handleError)
            );
    }

    getRecentLetterRequests(limit: number = 5): Observable<LetterRequest[]> {
        const user = this.userService.getCurrentUser();
        if (!user || !user.email) {
            return throwError(() => new Error('User email not available'));
        }
        
        return this.http.get<LetterRequest[]>(
            `${this.apiUrl}/recent/${encodeURIComponent(user.email)}?limit=${limit}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    getLetterRequestCount(): Observable<number> {
        const user = this.userService.getCurrentUser();
        if (!user || !user.email) {
            return throwError(() => new Error('User email not available'));
        }
        
        return this.http.get<number>(`${this.apiUrl}/count/${encodeURIComponent(user.email)}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    getLetterRequestById(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    getLetterAnalytics(dateRange: string): Observable<any> {
        return this.http.get(`/api/analytics?range=${dateRange}`);
    }

    getUserAnalytics(email: string, range: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/analytics/${encodeURIComponent(email)}?range=${range}`);
    }

    getGeneralAnalytics(range: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/analytics/general?range=${range}`);
    }

    getAllMyLetterRequests(): Observable<LetterRequest[]> {
        const user = this.userService.getCurrentUser();
        if (!user || !user.email) {
            return throwError(() => new Error('User email not available'));
        }
        return this.http.get<LetterRequest[]>(
            `${this.apiUrl}/all/${encodeURIComponent(user.email)}`
        ).pipe(
            catchError(this.handleError)
        );
    }

    getGeneratedLetter(id: string, format: 'pdf' | 'docx' = 'pdf'): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/${id}/generate?format=${format}`,
            { responseType: 'blob' }
        ).pipe(
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
            letterType: request.letterType,
            organizationName: request.organizationName,
            startDate: request.startDate,
            endDate: request.endDate,
            reasonForRequest: request.reasonForRequest,
            ...(request.effectiveDate && { effectiveDate: request.effectiveDate }),
            ...(request.researchTitle && { researchTitle: request.researchTitle }),
            ...(request.recommendationPurpose && { recommendationPurpose: request.recommendationPurpose }),
            ...(request.receivingInstitution && { receivingInstitution: request.receivingInstitution }),
            ...(request.submissionDeadline && { submissionDeadline: request.submissionDeadline }),
            ...(request.transcriptPurpose && { transcriptPurpose: request.transcriptPurpose }),
            ...(request.deliveryMethod && { deliveryMethod: request.deliveryMethod })
        };
    }

    // Token handling is now done by AuthInterceptor
    // This method is kept for backward compatibility
    private getAuthToken(): string {
        return '';
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
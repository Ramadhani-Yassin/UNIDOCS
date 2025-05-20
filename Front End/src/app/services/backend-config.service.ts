// src/app/services/backend-config.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendConfigService {
  private backendUrl = 'http://localhost:8088'; // Default local backend URL

  getBackendUrl(): string {
    return this.backendUrl;
  }

  setBackendUrl(url: string): void {
    this.backendUrl = url;
  }
}

// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8088', // Your existing API URL
  // Pawa AI Configuration
  pawaAI: {
    baseUrl: 'https://api.pawa-ai.com/v1',
    apiKey: 'sk-pw-wZZnVqVrZwn9mfh7i7-rvHesB8j3m4lQ-RIsJF21QLMh3Y0OgF_C1roZ1446TeAxH-iiVGEPT6LtpWkzYSSBo2IRi3VHe4nJ0g-vF_cRSHS19vSr3r8Lx9wPw45rRUlRJ6w',
    defaultModel: 'pawa-min-beta'
  }
  // Add this if you want to use apiBaseUrl instead:
      // apiBaseUrl: 'http://localhost:8088'
};
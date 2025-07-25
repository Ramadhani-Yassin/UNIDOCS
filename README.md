# UNIDOCS System

## Overview
UNIDOCS is a comprehensive digital documentation management system for students and administrators at The State University of Zanzibar. It streamlines the process of requesting, generating, and managing official university documents such as letters and CVs, and provides a platform for publishing and viewing announcements. The system consists of three main components:

- **Back End**: Spring Boot REST API
- **Front End**: Angular web application (Admin & Student portals)
- **Mobile App**: Flutter app for students (request letters, generate CVs, view announcements)

---

## Project Structure

```
FYP/
  ├── Back End/         # Spring Boot API
  ├── Front End/        # Angular Web App
  └── mobileapp/        # Flutter Student Mobile App
```

### Back End (Spring Boot)
- **Controller**: Handles HTTP requests for letters, users, CVs, and announcements.
- **DTO**: Data Transfer Objects for API communication.
- **Model**: JPA entities for database tables (LetterRequest, User, CVRequest, Announcement, etc).
- **Repository**: Spring Data JPA repositories for CRUD operations.
- **Service**: Business logic for document generation, email, analytics, etc.
- **Resources**: `application.properties` for configuration.

### Front End (Angular)
- **Pages**: Components for both admin and student sides.
  - **ADMIN-SIDE**: Manage/publish announcements, approve/decline letter requests, analytics, student management.
  - **STUDENT-SIDE**: Request letters, view all applications, generate CV, view announcements, settings.
- **Models**: TypeScript interfaces for data structures.
- **Services**: API communication for all features.
- **Environments**: Environment-specific configs.

### Mobile App (Flutter)
- **Student App**: Native mobile experience for students.
  - **Request Letters**: Fill dynamic forms for various letter types and submit requests.
  - **Generate CV**: Fill in details and generate a CV in multiple templates.
  - **View Announcements**: See all university announcements with attachments.
  - **All Applications**: Track all submitted letter requests, with search and filter.
  - **Settings**: Update profile information.
  - **Logout**: Secure logout with confirmation modal.
- **Modern UI/UX**: Sticky headers, custom color palette, interactive modals, and responsive design.

---

## Setup Instructions

### Back End
1. Navigate to the `Back End` directory.
2. Ensure you have Java and Maven installed.
3. Run:
   ```
   mvn spring-boot:run
   ```
4. The server runs on port 8080 by default.

### Front End
1. Navigate to the `Front End` directory.
2. Ensure you have Node.js and Angular CLI installed.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the app:
   ```
   ng serve
   ```
5. Access at `http://localhost:4200`.

### Mobile App (Flutter)
1. Navigate to the `mobileapp` directory.
2. Ensure you have Flutter installed (`flutter doctor`).
3. Install dependencies:
   ```
   flutter pub get
   ```
4. Run the app on an emulator or device:
   ```
   flutter run
   ```

---

## API Endpoints (Sample)
- **POST /api/letter-requests**: Create a new letter request
- **GET /api/letter-requests/{id}**: Retrieve a letter request by ID
- **GET /api/letter-requests/recent/{email}**: Get recent letter requests by email
- **GET /api/letter-requests/count/{email}**: Get the count of letter requests by email
- **POST /api/cv-requests**: Submit a CV generation request
- **GET /api/announcements/recent**: Get recent announcements

---

## Usage

- **Administrators**
  - Publish and manage announcements
  - Approve/decline student letter requests
  - View analytics and manage students

- **Students (Web & Mobile)**
  - Request official university letters (introduction, feasibility, recommendation, etc.)
  - Generate a professional CV in multiple templates
  - View all submitted applications and their statuses
  - Read university announcements and download attachments
  - Update profile and account settings
  - Securely log out

- **Mobile App**
  - All student-side features are available natively on Android/iOS via the Flutter app, with a modern, interactive UI.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🏆 Developed by

**Ramadhani Yassin**  
[Personal Website](http://ramadhani-yassin.vercel.app/)  
[LinkedIn](https://www.linkedin.com/in/ramadhani-yassin-ramadhani/)

<div align="center">
  <a href="https://github.com/Ramadhani-Yassin" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://www.linkedin.com/in/ramadhani-yassin-ramadhani/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="mailto:yasynramah@gmail.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
  <a href="http://ramadhani-yassin.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Website-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Website">
  </a>
</div>

---

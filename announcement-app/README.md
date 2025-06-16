# Announcement App

## Overview
The Announcement App is a full-stack application designed to manage announcements for students and administrators. It consists of a back-end built with Spring Boot and a front-end developed using Angular. The application allows users to publish, view, and manage announcements efficiently.

## Project Structure
The project is organized into two main directories: `Back End` and `Front End`.

### Back End
- **Controller**: Contains the `AnnouncementController` class, which handles HTTP requests related to announcements.
- **DTO**: Contains the `AnnouncementDTO` class, which is used to transfer announcement data between the client and server.
- **Model**: Contains the `Announcement` class, representing the announcement entity in the database.
- **Repository**: Contains the `AnnouncementRepository` interface for performing CRUD operations on announcements.
- **Service**: Contains the `AnnouncementService` class, which includes business logic for managing announcements.
- **Resources**: Contains the `application.properties` file for configuration settings.

### Front End
- **Pages**: Contains components for both the admin and student sides of the application.
  - **ADMIN-SIDE**: Includes the `PublishAnnouncementsComponent` for creating and publishing announcements.
  - **STUDENT-SIDE**: Includes the `AnnouncementsComponent` for displaying announcements to students.
- **Models**: Contains the `Announcement` interface, defining the structure of an announcement object.
- **Services**: Contains the `AnnouncementService` class for handling API calls related to announcements.
- **Environments**: Contains environment-specific configuration settings.

## Setup Instructions

### Back End
1. Navigate to the `Back End` directory.
2. Ensure you have Java and Maven installed.
3. Run the application using the command:
   ```
   mvn spring-boot:run
   ```
4. The back-end server will start on the configured port (default is 8080).

### Front End
1. Navigate to the `Front End` directory.
2. Ensure you have Node.js and Angular CLI installed.
3. Install the dependencies using:
   ```
   npm install
   ```
4. Start the Angular application using:
   ```
   ng serve
   ```
5. The front-end application will be available at `http://localhost:4200`.

## API Endpoints
- **POST /api/letter-requests**: Create a new letter request.
- **GET /api/letter-requests/{id}**: Retrieve a letter request by ID.
- **GET /api/letter-requests/recent/{email}**: Get recent letter requests by email.
- **GET /api/letter-requests/count/{email}**: Get the count of letter requests by email.

## Usage
- Administrators can publish announcements through the admin interface.
- Students can view announcements on the student interface.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
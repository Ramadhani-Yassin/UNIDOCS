# Announcement App

## Overview
The Announcement App is a full-stack application designed to manage announcements for students and administrators. It consists of a back-end built with Spring Boot and a front-end developed using Angular. This application allows users to publish, view, and manage announcements efficiently.

## Back-End

### Technologies Used
- Spring Boot
- Java
- JPA (Java Persistence API)
- PostgreSQL (or any other relational database)

### Directory Structure
- `src/main/java/com/suza/connect/controller`: Contains the controllers that handle HTTP requests.
- `src/main/java/com/suza/connect/dto`: Contains Data Transfer Objects (DTOs) for transferring data between client and server.
- `src/main/java/com/suza/connect/model`: Contains the entity classes that represent the database tables.
- `src/main/java/com/suza/connect/repository`: Contains the repository interfaces for database operations.
- `src/main/java/com/suza/connect/service`: Contains the service classes that implement business logic.
- `src/main/resources`: Contains configuration files such as `application.properties`.

### API Endpoints
- `POST /api/announcements`: Create a new announcement.
- `GET /api/announcements`: Retrieve all announcements.
- `GET /api/announcements/recent`: Retrieve recent announcements.
- `GET /api/announcements/{id}`: Retrieve a specific announcement by ID.

### Setup Instructions
1. Clone the repository.
2. Navigate to the `Back End` directory.
3. Configure the database connection in `application.properties`.
4. Run the application using your IDE or with the command `mvn spring-boot:run`.

## Front-End

### Technologies Used
- Angular
- TypeScript
- HTML/CSS

### Directory Structure
- `src/app/Pages/ADMIN-SIDE/publish-announcements`: Contains components for publishing announcements.
- `src/app/Pages/STUDENT-SIDE/announcements`: Contains components for viewing announcements.
- `src/app/models`: Contains TypeScript interfaces for data models.
- `src/app/services`: Contains services for API calls.

### Setup Instructions
1. Navigate to the `Front End` directory.
2. Install dependencies using `npm install`.
3. Configure the API URL in `environment.ts`.
4. Run the application using `ng serve`.

## Conclusion
This project provides a robust solution for managing announcements in an educational environment. With a clear separation of concerns between the front-end and back-end, it is designed to be scalable and maintainable.
# Announcement App

## Overview
This project is an announcement application that allows users to publish and view announcements. It consists of a back-end built with Spring Boot and a front-end developed using Angular.

## Project Structure
The project is organized into two main parts: the Back End and the Front End.

### Back End
- **Controller**: Handles HTTP requests related to announcements.
- **DTO**: Data Transfer Object for transferring announcement data.
- **Model**: Represents the announcement entity in the database.
- **Repository**: Provides methods for performing CRUD operations on announcements.
- **Service**: Contains business logic for managing announcements.
- **Application Properties**: Configuration settings for the Spring Boot application.

### Front End
- **Pages**: Contains components for publishing and viewing announcements.
  - **ADMIN-SIDE**: Includes the component for publishing announcements.
  - **STUDENT-SIDE**: Includes the component for viewing announcements.
- **Models**: Defines the structure of announcement objects.
- **Services**: Handles API calls related to announcements.
- **Environments**: Contains environment-specific configuration settings.

## Setup Instructions

### Back End
1. Navigate to the `Back End` directory.
2. Ensure you have Java and Maven installed.
3. Run the application using the command:
   ```
   mvn spring-boot:run
   ```
4. The back-end server will start, and you can access the API endpoints.

### Front End
1. Navigate to the `Front End` directory.
2. Ensure you have Node.js and Angular CLI installed.
3. Install the dependencies using the command:
   ```
   npm install
   ```
4. Run the application using the command:
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
- Admin users can publish announcements through the admin interface.
- Students can view announcements on the student interface.

## License
This project is licensed under the MIT License.
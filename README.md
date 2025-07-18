# UNIDOCS App

## Overview
The UNIDOCS App is a full-stack application designed to manage UNIDOCSs for students and administrators. It consists of a back-end built with Spring Boot and a front-end developed using Angular. The application allows users to publish, view, and manage UNIDOCSs efficiently.

## Project Structure
The project is organized into two main directories: `Back End` and `Front End`.

### Back End
- **Controller**: Contains the `UNIDOCSController` class, which handles HTTP requests related to UNIDOCSs.
- **DTO**: Contains the `UNIDOCSDTO` class, which is used to transfer UNIDOCS data between the client and server.
- **Model**: Contains the `UNIDOCS` class, representing the UNIDOCS entity in the database.
- **Repository**: Contains the `UNIDOCSRepository` interface for performing CRUD operations on UNIDOCSs.
- **Service**: Contains the `UNIDOCSService` class, which includes business logic for managing UNIDOCSs.
- **Resources**: Contains the `application.properties` file for configuration settings.

### Front End
- **Pages**: Contains components for both the admin and student sides of the application.
  - **ADMIN-SIDE**: Includes the `PublishUNIDOCSsComponent` for creating and publishing UNIDOCSs.
  - **STUDENT-SIDE**: Includes the `UNIDOCSsComponent` for displaying UNIDOCSs to students.
- **Models**: Contains the `UNIDOCS` interface, defining the structure of an UNIDOCS object.
- **Services**: Contains the `UNIDOCSService` class for handling API calls related to UNIDOCSs.
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
- Administrators can publish UNIDOCSs through the admin interface.
- Students can view UNIDOCSs on the student interface.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

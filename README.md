✨ UNIDOCS – University Document Management System (SPA)
A comprehensive document management system built with Laravel 10, MySQL, Inertia.js, and Vue.js, designed to streamline the generation, management, and processing of official university letters and documents. UNIDOCS simplifies administrative workflows, ensuring efficiency and accuracy in student and faculty requests.

🌟 Key Features
✅ Automated Letter Generation – Generate various university letters instantly.
✅ Letter Request Management – Track and process student and faculty document requests.
✅ Approval Workflow – Multi-step approval system for document processing.
✅ Notifications & Alerts – Stay updated with real-time request status.
✅ User Roles & Permissions – Secure access based on roles (Admin, Student, Staff).
✅ Reports & Analytics – Generate insights on document usage and trends.
✅ Storage & Archiving – Secure storage for past and processed documents.

🚀 Quick Start
Follow these steps to set up UNIDOCS locally:

1️⃣ Clone the repository:
bash
Copy
Edit
git clone https://github.com/yourusername/unidocs.git
cd unidocs
2️⃣ Install PHP dependencies:
bash
Copy
Edit
composer install
3️⃣ Copy environment configuration:
bash
Copy
Edit
cp .env.example .env
4️⃣ Generate application key:
bash
Copy
Edit
php artisan key:generate
5️⃣ Configure the database
Update the .env file with your local database credentials.

6️⃣ Run migrations and seed sample data:
bash
Copy
Edit
php artisan migrate:fresh --seed
7️⃣ Link storage for media files:
bash
Copy
Edit
php artisan storage:link
8️⃣ Install JavaScript and CSS dependencies:
bash
Copy
Edit
npm install && npm run dev
9️⃣ Start the Laravel development server:
bash
Copy
Edit
php artisan serve
📌 Tech Stack
Backend: Laravel 10, MySQL
Frontend: Inertia.js, Vue.js
UI/UX: Tailwind CSS
Authentication: Laravel Sanctum
💡 Contributing
We welcome contributions! Feel free to fork the repo, submit issues, or create pull requests.


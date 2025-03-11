<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIDOCS – University Document Management System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 800px;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        h2 {
            color: #444;
            margin-top: 20px;
        }
        p {
            color: #555;
        }
        .features, .setup, .tech-stack {
            margin-top: 15px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .code {
            background: #222;
            color: #fff;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            display: block;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✨ UNIDOCS – University Document Management System (SPA)</h1>
        <p>
            A comprehensive document management system built with <strong>Laravel 10, MySQL, Inertia.js, and Vue.js</strong>, 
            designed to streamline the generation, management, and processing of official university letters and documents. 
            <strong>UNIDOCS</strong> simplifies administrative workflows, ensuring efficiency and accuracy in student and faculty requests.
        </p>

        <h2>🌟 Key Features</h2>
        <div class="features">
            <p>✅ <strong>Automated Letter Generation</strong> – Generate various university letters instantly.</p>
            <p>✅ <strong>Letter Request Management</strong> – Track and process student and faculty document requests.</p>
            <p>✅ <strong>Approval Workflow</strong> – Multi-step approval system for document processing.</p>
            <p>✅ <strong>Notifications & Alerts</strong> – Stay updated with real-time request status.</p>
            <p>✅ <strong>User Roles & Permissions</strong> – Secure access based on roles (Admin, Student, Staff).</p>
            <p>✅ <strong>Reports & Analytics</strong> – Generate insights on document usage and trends.</p>
            <p>✅ <strong>Storage & Archiving</strong> – Secure storage for past and processed documents.</p>
        </div>

        <h2>🚀 Quick Start</h2>
        <div class="setup">
            <p>Follow these steps to set up <strong>UNIDOCS</strong> locally:</p>
            <p><strong>1️⃣ Clone the repository:</strong></p>
            <p class="code">git clone https://github.com/yourusername/unidocs.git <br> cd unidocs</p>

            <p><strong>2️⃣ Install PHP dependencies:</strong></p>
            <p class="code">composer install</p>

            <p><strong>3️⃣ Copy environment configuration:</strong></p>
            <p class="code">cp .env.example .env</p>

            <p><strong>4️⃣ Generate application key:</strong></p>
            <p class="code">php artisan key:generate</p>

            <p><strong>5️⃣ Configure the database</strong> (update <code>.env</code> file with your database credentials).</p>

            <p><strong>6️⃣ Run migrations and seed sample data:</strong></p>
            <p class="code">php artisan migrate:fresh --seed</p>

            <p><strong>7️⃣ Link storage for media files:</strong></p>
            <p class="code">php artisan storage:link</p>

            <p><strong>8️⃣ Install JavaScript and CSS dependencies:</strong></p>
            <p class="code">npm install && npm run dev</p>

            <p><strong>9️⃣ Start the Laravel development server:</strong></p>
            <p class="code">php artisan serve</p>
        </div>

        <h2>📌 Tech Stack</h2>
        <div class="tech-stack">
            <p>🛠️ <strong>Backend:</strong> Laravel 10, MySQL</p>
            <p>🎨 <strong>Frontend:</strong> Inertia.js, Vue.js</p>
            <p>🖌️ <strong>UI/UX:</strong> Tailwind CSS</p>
            <p>🔐 <strong>Authentication:</strong> Laravel Sanctum</p>
        </div>

        <h2>💡 Contributing</h2>
        <p>We welcome contributions! Feel free to fork the repo, submit issues, or create pull requests.</p>

        <h2>📜 License</h2>
        <p>This project is open-source and licensed under the <a href="LICENSE">MIT License</a>.</p>

        <p style="text-align: center; font-weight: bold;">🔥 Built with passion for academic excellence! 🚀</p>
    </div>
</body>
</html>

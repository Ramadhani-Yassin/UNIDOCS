import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Pages/HOME-PAGES/home/home.component';
import { AboutUsComponent } from './Pages/HOME-PAGES/about-us/about-us.component';
import { ContactsComponent } from './Pages/HOME-PAGES/contacts/contacts.component';
//import { SignUpComponent } from './Pages/sign-up/sign-up.component';
import { DashboardComponent } from './Pages/STUDENT-SIDE/Students-Dashboard/Dashboard.component';
import { LoginComponent } from './Pages/STUDENT-SIDE/Login/login.component';
import { AdminLoginComponent } from './Pages/ADMIN-SIDE/admin-login/admin-login.component';
import { AdminPortalComponent } from './Pages/ADMIN-SIDE/admin-portal/admin-portal.component';
import { AnalyticsComponent } from './Pages/STUDENT-SIDE/analytics/analytics.component';
import { MessagesComponent } from './Pages/STUDENT-SIDE/messages/messages.component';
import { ApplicationComponent } from './Pages/STUDENT-SIDE/application/application.component';
import { AnnouncementsComponent } from './Pages/STUDENT-SIDE/announcements/announcements.component';
import { LettersRequestedComponent } from './Pages/ADMIN-SIDE/letters-requested/letters-requested.component';
import { PublishAnnouncementsComponent } from './Pages/ADMIN-SIDE/publish-announcements/publish-announcements.component';
import { GeneralAnalyticsComponent } from './Pages/ADMIN-SIDE/general-analytics/general-analytics.component';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { StudentsManagementComponent } from './Pages/ADMIN-SIDE/students-management/students-management.component';
import { StudentNavComponent } from './components/student-nav/student-nav.component';

// Import your shell components
import { StudentSettingsShellComponent } from './Pages/STUDENT-SIDE/student-settings-shell/student-settings-shell.component';
import { AdminSettingsShellComponent } from './Pages/ADMIN-SIDE/admin-settings-shell/admin-settings-shell.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contacts', component: ContactsComponent },
  // { path: 'sign-up', component: SignUpComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-portal', component: AdminPortalComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'application', component: ApplicationComponent },
  { path: 'announcements', component: AnnouncementsComponent },
  // Use shell components for settings
  { path: 'settings', component: StudentSettingsShellComponent },
  { path: 'admin/settings', component: AdminSettingsShellComponent },
  { path: 'letters-requested', component: LettersRequestedComponent },
  { path: 'publish-announcements', component: PublishAnnouncementsComponent },
  { path: 'general-analytics', component: GeneralAnalyticsComponent },
  { path: 'admin-nav', component: AdminNavComponent },
  { path: 'students-management', component: StudentsManagementComponent },
  { path: 'student-nav', component: StudentNavComponent },
  { path: '**', component: HomeComponent } // Wildcard route for unknown paths
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
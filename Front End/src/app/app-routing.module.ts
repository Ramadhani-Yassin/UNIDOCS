import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Pages/HOME-PAGES/home/home.component';
import { AboutUsComponent } from './Pages/HOME-PAGES/about-us/about-us.component';
import { ContactsComponent } from './Pages/HOME-PAGES/contacts/contacts.component';
//import { SignUpComponent } from './Pages/sign-up/sign-up.component';
import { DashboardComponent } from './Pages/STUDENT-SIDE/Students-Dashboard/Dashboard.component'; // Update import path
import { LoginComponent } from './Pages/STUDENT-SIDE/Login/login.component'; // Update import path
import { AdminLoginComponent } from './Pages/ADMIN-SIDE/admin-login/admin-login.component';
import { AdminPortalComponent } from './Pages/ADMIN-SIDE/admin-portal/admin-portal.component';
import { AnalyticsComponent } from './Pages/STUDENT-SIDE/analytics/analytics.component';
import { MessagesComponent } from './Pages/STUDENT-SIDE/messages/messages.component';
import {  ApplicationComponent } from './Pages/STUDENT-SIDE/application/application.component';
import { AnnouncementsComponent } from './Pages/STUDENT-SIDE/announcements/announcements.component'; 
import { SettingsComponent } from './Pages/STUDENT-SIDE/settings/settings.component';
import { LettersRequestedComponent } from './Pages/ADMIN-SIDE/letters-requested/letters-requested.component';
import { ApprovedLettersComponent } from './Pages/ADMIN-SIDE/approved-letters/approved-letters.component';
import { GeneralAnalyticsComponent } from './Pages/ADMIN-SIDE/general-analytics/general-analytics.component';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { StudentsManagementComponent } from './Pages/ADMIN-SIDE/students-management/students-management.component';
import { StudentNavComponent } from './components/student-nav/student-nav.component';


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
  { path: 'settings', component: SettingsComponent },
  { path: 'letters-requested', component: LettersRequestedComponent },
  { path: 'approved-letters', component: ApprovedLettersComponent },
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
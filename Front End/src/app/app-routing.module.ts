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
import { ManageAnnouncementsComponent} from './Pages/ADMIN-SIDE/manage-announcements/manage-announcements.component';
import { StudentNavComponent } from './components/student-nav/student-nav.component'; 
import { CVGeneratorComponent } from './Pages/STUDENT-SIDE/cv-generator/cv-generator.component';
import { StudentSettingsShellComponent } from './Pages/STUDENT-SIDE/student-settings-shell/student-settings-shell.component';
import { AdminSettingsShellComponent } from './Pages/ADMIN-SIDE/admin-settings-shell/admin-settings-shell.component';
import { AllRequestComponent } from './Pages/ADMIN-SIDE/all-request/all-request.component';
import { MyApplicationsComponent } from './Pages/STUDENT-SIDE/my-applications/my-applications.component';
import { AuthGuard } from './auth.guard';
import { ForgotPasswordComponent } from './Pages/STUDENT-SIDE/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Pages/STUDENT-SIDE/reset-password/reset-password.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // All routes below are protected
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'All-Applications', component: MyApplicationsComponent , canActivate: [AuthGuard] },
  { path: 'All-Requests', component: AllRequestComponent, canActivate: [AuthGuard] },
  { path: 'admin-portal', component: AdminPortalComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'application', component: ApplicationComponent, canActivate: [AuthGuard] },
  { path: 'announcements', component: AnnouncementsComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: StudentSettingsShellComponent, canActivate: [AuthGuard] },
  { path: 'admin/settings', component: AdminSettingsShellComponent, canActivate: [AuthGuard] },
  { path: 'letters-requested', component: LettersRequestedComponent, canActivate: [AuthGuard] },
  { path: 'publish-announcements', component: PublishAnnouncementsComponent, canActivate: [AuthGuard] },
  { path: 'general-analytics', component: GeneralAnalyticsComponent, canActivate: [AuthGuard] },
  { path: 'admin-nav', component: AdminNavComponent, canActivate: [AuthGuard] },
  { path: 'generate-cv', component: CVGeneratorComponent, canActivate: [AuthGuard] },
  { path: 'manage-announcements', component: ManageAnnouncementsComponent, canActivate: [AuthGuard] },
  { path: 'students-management', component: StudentsManagementComponent, canActivate: [AuthGuard] },
  { path: 'student-nav', component: StudentNavComponent, canActivate: [AuthGuard] },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts'; // <-- Corrected import

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Pages/HOME-PAGES/home/home.component';
import { AboutUsComponent } from './Pages/HOME-PAGES/about-us/about-us.component';
import { ContactsComponent } from './Pages/HOME-PAGES/contacts/contacts.component';
import { DashboardComponent } from './Pages/STUDENT-SIDE/Students-Dashboard/Dashboard.component';
import { LoginComponent } from './Pages/STUDENT-SIDE/Login/login.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminPortalComponent } from './Pages/ADMIN-SIDE/admin-portal/admin-portal.component';
import { AdminLoginComponent } from './Pages/ADMIN-SIDE/admin-login/admin-login.component';
import { AnalyticsComponent } from './Pages/STUDENT-SIDE/analytics/analytics.component';
import { MessagesComponent } from './Pages/STUDENT-SIDE/messages/messages.component';
import { ApplicationComponent } from './Pages/STUDENT-SIDE/application/application.component';
import { AnnouncementsComponent } from './Pages/STUDENT-SIDE/announcements/announcements.component';
import { SettingsComponent } from './Pages/STUDENT-SIDE/settings/settings.component';
import { LettersRequestedComponent } from './Pages/ADMIN-SIDE/letters-requested/letters-requested.component';
import { GeneralAnalyticsComponent } from './Pages/ADMIN-SIDE/general-analytics/general-analytics.component';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { StudentNavComponent } from './components/student-nav/student-nav.component';
import { UserService } from './services/user.service';
import { StudentsManagementComponent } from './Pages/ADMIN-SIDE/students-management/students-management.component';
import { PublishAnnouncementsComponent } from './Pages/ADMIN-SIDE/publish-announcements/publish-announcements.component';
import { StudentSettingsShellComponent } from './Pages/STUDENT-SIDE/student-settings-shell/student-settings-shell.component';
import { AdminSettingsShellComponent } from './Pages/ADMIN-SIDE/admin-settings-shell/admin-settings-shell.component';
import { CVGeneratorComponent } from './Pages/STUDENT-SIDE/cv-generator/cv-generator.component';
import { AllRequestComponent } from './Pages/ADMIN-SIDE/all-request/all-request.component';
import { MyApplicationsComponent } from './Pages/STUDENT-SIDE/my-applications/my-applications.component';
import { ManageAnnouncementsComponent } from './Pages/ADMIN-SIDE/manage-announcements/manage-announcements.component';
import { EditAnnouncementModalComponent } from './components/edit-announcement/edit-announcement-modal.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ForgotPasswordComponent } from './Pages/STUDENT-SIDE/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Pages/STUDENT-SIDE/reset-password/reset-password.component';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';
import { Nl2brPipe } from './pipes/nl2br.pipe';
import { MockPawaAIService } from './services/mock-pawa-ai.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutUsComponent,
    ContactsComponent,
    DashboardComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    AdminPortalComponent,
    AdminLoginComponent,
    AnalyticsComponent,
    MessagesComponent,
    AnnouncementsComponent,
    SettingsComponent,
    ApplicationComponent,
    LettersRequestedComponent,
    GeneralAnalyticsComponent,
    AdminNavComponent,
    StudentNavComponent,
    StudentsManagementComponent,
    PublishAnnouncementsComponent,
    StudentSettingsShellComponent,
    AdminSettingsShellComponent,
    CVGeneratorComponent,
    AllRequestComponent,
    MyApplicationsComponent,
    ManageAnnouncementsComponent,
    EditAnnouncementModalComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AiChatComponent,
    Nl2brPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule // <-- Corrected import in imports array
  ],
  providers: [
    UserService,
    MockPawaAIService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
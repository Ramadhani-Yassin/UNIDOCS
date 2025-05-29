import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { SignUpComponent } from './Pages/sign-up/sign-up.component';
import { UserService } from './services/user.service';
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
import {  ApplicationComponent } from './Pages/STUDENT-SIDE/application/application.component';
import { AnnouncementsComponent } from './Pages/STUDENT-SIDE/announcements/announcements.component';
import { SettingsComponent } from './Pages/STUDENT-SIDE/settings/settings.component';
import { LettersRequestedComponent } from './Pages/ADMIN-SIDE/letters-requested/letters-requested.component';
import { ApprovedLettersComponent } from './Pages/ADMIN-SIDE/approved-letters/approved-letters.component';
import { StudentsManagementComponent } from './Pages/ADMIN-SIDE/students-management/students-management.component';
import { GeneralAnalyticsComponent } from './Pages/ADMIN-SIDE/general-analytics/general-analytics.component';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { StudentNavComponent } from './components/student-nav/student-nav.component';

@NgModule({
  declarations: [
    AppComponent,
    //SignUpComponent,
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
    ApprovedLettersComponent,
    StudentsManagementComponent,
    GeneralAnalyticsComponent,
    AdminNavComponent,
    StudentNavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
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
import { LoginComponent } from './Pages/STUDENT-SIDE/Login/Login.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminPortalComponent } from './Pages/ADMIN-SIDE/admin-portal/admin-portal.component';
import { AdminLoginComponent } from './Pages/ADMIN-SIDE/admin-login/admin-login.component';

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
    AdminLoginComponent
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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { AboutUsComponent } from './Pages/about-us/about-us.component';
import { ContactsComponent } from './Pages/contacts/contacts.component';
//import { SignUpComponent } from './Pages/sign-up/sign-up.component';
import { DashboardComponent } from './Pages/Students-Dashboard/Dashboard.component'; // Update import path
import { LoginComponent  } from './Pages/Login/Login.component';// Update import path
import { AdminLoginComponent } from './Pages/admin-login/admin-login.component';
import { AdminPortalComponent } from './Pages/admin-portal/admin-portal.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contacts', component: ContactsComponent },
  //{ path: 'sign-up', component: SignUpComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  {path: 'admin-portal', component: AdminPortalComponent},
  {path: 'admin-login', component: AdminLoginComponent},
  { path: '**', component: HomeComponent } // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
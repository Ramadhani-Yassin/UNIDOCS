import { Component } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class ContactsComponent {

}




/**
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  user: User = new User();
  registrationSuccessful = false;
registrationError: any;
firstName: any;
lastName: any;
email: any;
password: any;
signUpForm: any;

  constructor(private userService: UserService, private router: Router) {}

  onSubmit() {
    this.userService.createUser(this.user).subscribe(
      response => {
        console.log('User registered successfully', response);
        this.registrationSuccessful = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000); // Redirect to login after 3 seconds (adjust as needed)
      },
      error => {
        console.error('Error registering user', error);
        // Handle error if needed
      }
    );
  }
}

**/
import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  userId! : number ;
  constructor(private userService: UserService, private router: Router) {}

  login() {
    this.userService.login(this.email, this.password).subscribe(
      (response: any) => {
        console.log(response);
        console.log(response.userId);
        this.userId =response.userId ;
          this.router.navigate(['frontClient', this.userId]);
        
      },
      (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    );
  }

  

}

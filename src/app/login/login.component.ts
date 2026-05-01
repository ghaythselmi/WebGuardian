import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email       = '';
  password    = '';
  errorMessage = '';
  isLoading   = false;
  showPassword = false;

  constructor(private userService: UserService, private router: Router) {}

  login() {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.login(this.email, this.password).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.router.navigate(['frontClient', response.userId]);
      },
      () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    );
  }
}

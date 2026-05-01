import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../entity/user';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading     = false;
  showPassword  = false;
  showConfirm   = false;
  errorMessage  = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username:        ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms:           [false, Validators.requiredTrue]
    });
  }

  get passwordMismatch(): boolean {
    const p = this.signupForm.get('password')?.value;
    const c = this.signupForm.get('confirmPassword')?.value;
    return !!(c && p !== c);
  }

  onSubmit() {
    this.errorMessage = '';
    if (this.signupForm.invalid || this.passwordMismatch) return;

    this.isLoading = true;
    const { username, email, password } = this.signupForm.value;
    const user: User = { username, email, password };

    this.userService.createUser(user).subscribe(
      () => {
        this.isLoading = false;
        this.successMessage = 'Account created! Redirecting to login…';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      () => {
        this.isLoading = false;
        this.errorMessage = 'Registration failed. Email may already be in use.';
      }
    );
  }
}

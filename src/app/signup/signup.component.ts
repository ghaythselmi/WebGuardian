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

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      
    });
  }

 

  onSubmit() {
    if (this.signupForm.valid) {
      const { username, email, password, imageUrl } = this.signupForm.value;
      
      // Ensure passwords match
      if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      const user: User = { username, email, password, imageUrl };
      console.log(user)
      this.userService.createUser(user).subscribe(
        (response) => {
          
          console.log('User registered successfully:', response);
          this.router.navigate(['/login']);
        },
        (error) => {
          // Handle error
          console.error('Registration error:', error);
        }
      );
    }
  }
}

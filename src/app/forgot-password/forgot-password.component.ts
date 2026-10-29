import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  error = '';
  loading = false;

  constructor(private users: UserService) {}

  requestReset(): void {
    this.message = '';
    this.error = '';
    this.loading = true;
    this.users.requestPasswordReset(this.email).subscribe({
      next: response => { this.message = response.message; this.loading = false; },
      error: () => { this.error = 'We could not send your reset link right now. Please try again.'; this.loading = false; }
    });
  }
}

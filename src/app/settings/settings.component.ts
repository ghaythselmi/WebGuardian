import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  error = '';
  loading = false;

  constructor(private users: UserService) {}

  updatePassword(): void {
    this.message = '';
    this.error = '';
    if (this.newPassword.length < 8) { this.error = 'Your new password must be at least 8 characters.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.error = 'The new passwords do not match.'; return; }
    this.loading = true;
    this.users.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: response => { this.message = response.message; this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; this.loading = false; },
      error: response => { this.error = response.error?.error || 'Could not change your password. Please try again.'; this.loading = false; }
    });
  }
}

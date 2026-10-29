import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  message = '';
  error = '';
  loading = false;
  complete = false;

  constructor(private route: ActivatedRoute, private router: Router, private users: UserService) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) this.error = 'This reset link is missing its security token. Request a new link to continue.';
  }

  updatePassword(): void {
    this.error = '';
    if (this.password.length < 8) { this.error = 'Choose a password with at least 8 characters.'; return; }
    if (this.password !== this.confirmPassword) { this.error = 'The passwords do not match.'; return; }
    this.loading = true;
    this.users.resetPassword(this.token, this.password).subscribe({
      next: response => { this.message = response.message; this.complete = true; this.loading = false; },
      error: response => { this.error = response.error?.error || 'This reset link is invalid or has expired. Request a new one.'; this.loading = false; }
    });
  }

  goToLogin(): void { this.router.navigate(['/login']); }
}

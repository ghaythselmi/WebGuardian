import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { User } from '../entity/user';
import { UserService } from '../services/user.service';
import { WebsitesService } from '../services/websites.service';
import { Website } from '../entity/website';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userId!: number;
  user: User = new User();
  isLoading = true;
  errorMessage = '';
  websites: Website[] = [];
  savingAlerts = false;
  alertMessage = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private websitesService: WebsitesService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userService.me().subscribe(
      data => {
        this.user = data;
        this.userId = data.id!;
        this.websitesService.getWebsites().subscribe({
          next: websites => this.websites = websites,
          error: () => this.websites = []
        });
        this.isLoading = false;
      },
      () => {
        this.errorMessage = 'Unable to load profile.';
        this.isLoading = false;
      }
    );
  }

  get profileImageUrl(): SafeUrl | string {
    return this.user.imageUrl
      ? this.sanitizer.bypassSecurityTrustUrl(this.user.imageUrl)
      : '';
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  get onlineCount(): number { return this.websites.filter(site => site.availability === 'Online').length; }
  get expiringSslCount(): number { return this.websites.filter(site => site.ssl_status !== 'Valid' || (site.expires_in ?? 0) <= 30).length; }

  setEmailAlerts(enabled: boolean): void {
    if (this.savingAlerts || this.user.id === undefined) return;
    this.savingAlerts = true;
    this.alertMessage = '';
    this.userService.updateUser(this.user.id, { ...this.user, emailAlertsEnabled: enabled }).subscribe({
      next: updated => { this.user = updated; this.savingAlerts = false; this.alertMessage = 'Alert preference saved.'; },
      error: () => { this.user.emailAlertsEnabled = !enabled; this.savingAlerts = false; this.alertMessage = 'Could not save your alert preference.'; }
    });
  }
}

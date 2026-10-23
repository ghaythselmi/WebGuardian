import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { User } from '../entity/user';
import { UserService } from '../services/user.service';

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

  constructor(
    private router: Router,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userService.me().subscribe(
      data => {
        this.user = data;
        this.userId = data.id!;
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
}

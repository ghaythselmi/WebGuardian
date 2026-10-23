import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.userId) {
      this.errorMessage = 'Unable to load profile.';
      this.isLoading = false;
      return;
    }

    this.userService.getUser(this.userId).subscribe(
      data => {
        this.user = data;
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
    this.router.navigate(['/frontClient', this.userId]);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { User } from '../entity/user';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  userId!: number;
  user!: User;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private httpClient: HttpClient,  
    private service: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params["id"];
    console.log(this.userId);
    this.user = new User();
    
    this.service.getUser(this.userId).subscribe(data => {
      this.user = data;
      console.log(this.user);
      console.log(this.user.imageUrl)
    }, error => console.log(error));
    
  }
  getSanitizedImageUrl(imageUrl: string | undefined): any {
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl || '');
  }

  logout() {
    this.router.navigate(['/login']);
  }
}

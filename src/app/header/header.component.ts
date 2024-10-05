import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../entity/user';
import { Website } from '../entity/website'; 

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() userId!: number; 

  constructor(
    private router: Router,  
    private userService: UserService,
    
  ) {}
  url: string = '';
  result: any;
  lastScrollTop = 0;
  navbarVisible = true;
  dropdownVisible = false;
  user!: User;
  websites: Website[] = [];

  ngOnInit(): void {
   
    this.user = new User();

    this.userService.getUser(this.userId).subscribe(
      data => {
        this.user = data;
      },
      error => console.error(error)
    );    
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownVisible = !this.dropdownVisible;
  }
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.lastScrollTop) {
      this.navbarVisible = false;
    } else {
      this.navbarVisible = true;
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}

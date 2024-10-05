import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { User } from '../../entity/user';
import { MonitoringService } from '../../services/monitoring.service';

@Component({
  selector: 'app-front-client',
  templateUrl: './front-client.component.html',
  styleUrls: ['./front-client.component.css']
})
export class FrontClientComponent implements OnInit {
 

  url: string = '';
  result: any;

  userId!: number;
  user!: User;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private httpClient: HttpClient,  
    private service: UserService,
    private websiteMonitorService: MonitoringService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params["id"];
    this.user = new User();

    this.service.getUser(this.userId).subscribe(
      data => {
        this.user = data;
      },
      error => console.error(error)
    );
  }

  
  


  checkWebsite() {
    this.websiteMonitorService.checkWebsite(this.url).subscribe(
      response => {
        this.result = response;
      },
      error => console.error('Error checking website:', error)
    );
  }

 
}

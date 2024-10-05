import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { MonitoringService } from '../services/monitoring.service';
import { WebsitesService } from '../services/websites.service'; 
import { User } from '../entity/user';
import { Website } from '../entity/website'; 
import * as Papa from 'papaparse';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit, OnDestroy {
  url: string = '';
  result: any;
  userId!: number;
  user!: User;
  websites: Website[] = [];
  intervalId: any;
  loading: boolean = false;
  constructor(
    private route: ActivatedRoute,  
    private userService: UserService,
    private websiteMonitorService: MonitoringService,
    private websitesService: WebsitesService 
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params["id"];
    this.user = new User();

    this.loadUser();
    this.getWebsitesByUserId(); 

    this.intervalId = setInterval(() => {
      this.updatedCheck();
    }, 300000); 
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadUser() {
    this.userService.getUser(this.userId).subscribe(
      data => {
        this.user = data;
      },
      error => console.error(error)
    );
  }

  updatedCheck() {
    this.loading = true; 
    
    const requests = this.websites.map(website => {
      if (website.url) {
        return this.websiteMonitorService.checkWebsite(website.url).toPromise().then(
          response => {
            website.availability = response.availability.status;
            website.ssl_status = response.ssl.status || 'Expired';
            website.expires_in = response.ssl.expires_in_days;
            return this.websitesService.updateWebsite(website.id!, website).toPromise();
          },
          error => {
            console.error(`Error checking website ${website.url}:`, error);
            return null;
          }
        );
      } else {
        return Promise.resolve(null); 
      }
    });

    
    Promise.allSettled(requests).then(() => {
      this.loading = false; 
      this.refreshPage(); 
    });
  }
  
  
  updateWebsite(website: Website) {
    if (!website.url) {
      console.error('Website URL is undefined.');
      return;
    }

    this.websiteMonitorService.checkWebsite(website.url).subscribe(
      response => {
        website.availability = response.availability.status;
        website.ssl_status = response.ssl.status || 'Expired';
        website.expires_in = response.ssl.expires_in_days;

        console.log(`Updating website ${website.url} with new data...`);

        this.websitesService.updateWebsite(website.id!, website).subscribe(
          updatedWebsite => {
            console.log('Website updated successfully in the backend:', updatedWebsite);
            this.refreshPage(); 
          },
          error => {
            console.error(`Error updating website ${website.url} in the backend:`, error);
          }
        );
      },
      error => {
        console.error(`Error checking website ${website.url}:`, error);
      }
    );
  }
  
  checkWebsite(url: string) {
    this.websiteMonitorService.checkWebsite(url).subscribe(
      response => {
        this.result = response;
        console.log(this.result);
        this.addWebsite(url); 
      },
      error => {
        console.error('Error checking website:', error);
      }
    );
  }

  getWebsitesByUserId() {
    this.websitesService.getWebsitesByUser(this.userId).subscribe(
      (data: Website[]) => {
        this.websites = data;
        console.log(this.websites);
      },
      error => {
        console.error('Error fetching websites for user:', error);
      }
    );
  }

  addWebsite(url: string) {
    if (!this.result) {
      console.error('No result available to add website');
      return;
    }
  
    const newWebsite: Website = {
      url: url,
      availability: this.result.availability.status,
      ssl_status: this.result.ssl.status || 'Expired',
      expires_in: this.result.ssl.expires_in_days,
      user_id: this.user.id
    };
    console.log(newWebsite);
  
    this.websitesService.createWebsite(newWebsite).subscribe(
      (response: Website) => {
        console.log('Website added successfully:', response);
        this.websites.push(response);
        this.refreshPage(); // Refresh the page after adding
      },
      error => {
        console.error('Error adding website:', error);
      }
    );
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading = true; // Start loading when the file upload begins
  
      Papa.parse(file, {
        complete: (result) => {
          const urls = result.data.map((row: any) => row[0]); 
          this.checkMultipleWebsites(urls);
        },
        header: false,
        skipEmptyLines: true
      });
    }
  }
  
  checkMultipleWebsites(urls: string[]) {
    const requests = urls.map(url => {
      return this.checkWebsitePromise(url); // Use promise-based checkWebsite
    });
  
    // Wait for all websites to be checked and added, then stop loading
    Promise.allSettled(requests).then(() => {
      this.loading = false; // Stop loading when all websites are processed
      this.refreshPage(); // Optionally refresh the page after adding
    });
  }
  
  checkWebsitePromise(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.websiteMonitorService.checkWebsite(url).subscribe(
        response => {
          this.result = response;
          this.addWebsite(url); // Add the website to the list
          resolve(); // Resolve the promise when the website is processed
        },
        error => {
          console.error('Error checking website:', error);
          reject(error); // Reject the promise in case of error
        }
      );
    });
  }
  

  deleteWebsite(id: number) {
    this.websitesService.deleteWebsite(id).subscribe(
      response => {
        console.log('Website deleted successfully:', response);
        this.websites = this.websites.filter(website => website.id !== id);
        this.refreshPage(); // Refresh the page after deletion
      },
      error => {
        console.error('Error deleting website:', error);
      }
    );
  }

  // Refresh the page
  refreshPage() {
    window.location.reload();
  }
}

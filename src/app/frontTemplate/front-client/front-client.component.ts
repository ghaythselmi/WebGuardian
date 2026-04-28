import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { User } from '../../entity/user';
import { MonitoringService } from '../../services/monitoring.service';
import { WebsitesService } from '../../services/websites.service';
import { Website } from '../../entity/website';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-front-client',
  templateUrl: './front-client.component.html',
  styleUrls: ['./front-client.component.css']
})
export class FrontClientComponent implements OnInit, OnDestroy {
  url: string = '';
  result: any;
  userId!: number;
  user!: User;
  websites: Website[] = [];
  loading: boolean = false;
  intervalId: any;
  showScrollTop: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private userService: UserService,
    private websiteMonitorService: MonitoringService,
    private websitesService: WebsitesService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params["id"];
    this.user = new User();

    this.userService.getUser(this.userId).subscribe(
      data => {
        this.user = data;
        this.getWebsitesByUserId();
      },
      error => console.error(error)
    );

    // Auto-refresh every 5 minutes
    this.intervalId = setInterval(() => {
      if (this.websites.length > 0) {
        this.updatedCheck();
      }
    }, 300000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Listen to scroll event from window
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollTop = window.scrollY > 300;
  }

  checkWebsite() {
    if (!this.url.trim()) return;

    this.websiteMonitorService.checkWebsite(this.url).subscribe(
      response => {
        this.result = response;
        this.addWebsite(this.url);
      },
      error => console.error('Error checking website:', error)
    );
  }

  addWebsite(url: string) {
    if (!this.result) return;

    const newWebsite: Website = {
      url: url,
      availability: this.result.availability?.status || 'Unknown',
      ssl_status: this.result.ssl?.status || 'Expired',
      expires_in: this.result.ssl?.expires_in_days || 0,
      user_id: this.user.id,
      last_check: new Date()
    };

    this.websitesService.createWebsite(newWebsite).subscribe(
      (response: Website) => {
        console.log('Website added successfully:', response);
        this.websites.push(response);
        this.url = '';
        this.result = null;
      },
      error => console.error('Error adding website:', error)
    );
  }

  getWebsitesByUserId() {
    this.websitesService.getWebsitesByUser(this.userId).subscribe(
      (data: Website[]) => {
        this.websites = data;
      },
      error => console.error('Error fetching websites:', error)
    );
  }

  updatedCheck() {
    this.loading = true;

    const requests = this.websites.map(website => {
      if (website.url) {
        return this.websiteMonitorService.checkWebsite(website.url).toPromise().then(
          response => {
            website.availability = response.availability?.status || 'Offline';
            website.ssl_status = response.ssl?.status || 'Expired';
            website.expires_in = response.ssl?.expires_in_days || 0;
            website.last_check = new Date();
            return this.websitesService.updateWebsite(website.id!, website).toPromise();
          },
          error => {
            console.error(`Error checking ${website.url}:`, error);
            return null;
          }
        );
      }
      return Promise.resolve(null);
    });

    Promise.allSettled(requests).then(() => {
      this.loading = false;
    });
  }

  updateWebsite(website: Website) {
    if (!website.url) return;

    this.websiteMonitorService.checkWebsite(website.url).subscribe(
      response => {
        website.availability = response.availability?.status || 'Offline';
        website.ssl_status = response.ssl?.status || 'Expired';
        website.expires_in = response.ssl?.expires_in_days || 0;
        website.last_check = new Date();

        this.websitesService.updateWebsite(website.id!, website).subscribe(
          updatedWebsite => {
            console.log('Website updated successfully');
            const index = this.websites.findIndex(w => w.id === website.id);
            if (index !== -1) this.websites[index] = updatedWebsite;
          },
          error => console.error('Error updating website:', error)
        );
      },
      error => console.error('Error checking website:', error)
    );
  }

  deleteWebsite(id: number) {
    if (confirm('Are you sure you want to delete this website?')) {
      this.websitesService.deleteWebsite(id).subscribe(
        response => {
          this.websites = this.websites.filter(website => website.id !== id);
        },
        error => console.error('Error deleting website:', error)
      );
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading = true;

      Papa.parse(file, {
        complete: (result) => {
          const urls = result.data.map((row: any) => row[0]).filter((url: string) => url && url.trim());
          this.checkMultipleWebsites(urls);
        },
        header: false,
        skipEmptyLines: true
      });
    }
  }

  checkMultipleWebsites(urls: string[]) {
    const requests = urls.map(url => {
      return new Promise<void>((resolve) => {
        this.websiteMonitorService.checkWebsite(url).subscribe(
          response => {
            const newWebsite: Website = {
              url: url,
              availability: response.availability?.status || 'Unknown',
              ssl_status: response.ssl?.status || 'Expired',
              expires_in: response.ssl?.expires_in_days || 0,
              user_id: this.user.id,
              last_check: new Date()
            };
            this.websitesService.createWebsite(newWebsite).subscribe(() => resolve());
          },
          error => {
            console.error(`Error checking ${url}:`, error);
            resolve();
          }
        );
      });
    });

    Promise.allSettled(requests).then(() => {
      this.loading = false;
      this.getWebsitesByUserId();
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
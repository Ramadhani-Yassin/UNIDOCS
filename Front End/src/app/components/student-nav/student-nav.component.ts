import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { StudentSidebarService } from '../../services/student-sidebar.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-student-nav', // This MUST match what you use in templates
  templateUrl: './student-nav.component.html',
  styleUrls: ['./student-nav.component.css']
})
export class StudentNavComponent implements OnInit, OnDestroy {
  private sidebarSubscription!: Subscription;
  private routerSubscription!: Subscription;
  public isMobile = false;
  private mobileBreakpoint = 768;
  public currentPageTitle = 'Dashboard';

  constructor(
    public sidebarService: StudentSidebarService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    
    this.sidebarSubscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      if (this.isMobile) {
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
      }
    });

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < this.mobileBreakpoint;
    if (this.isMobile) {
      this.sidebarService.close();
    }
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  confirmLogout(event: Event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      // Perform logout
    }
  }

  private updatePageTitle() {
  const url = this.router.url;
  if (url.includes('dashboard')) {
    this.currentPageTitle = 'Dashboard';
  } else if (url.includes('students')) {
    this.currentPageTitle = 'Students';
  } else if (url.includes('applications')) {
    this.currentPageTitle = 'Applications';
  } else if (url.includes('settings')) {
    this.currentPageTitle = 'Settings';
  } else if (url.includes('announcements')) {
    this.currentPageTitle = 'Announcements';
  }
}

  ngOnDestroy() {
    this.sidebarSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    document.body.style.overflow = 'auto';
  }
}
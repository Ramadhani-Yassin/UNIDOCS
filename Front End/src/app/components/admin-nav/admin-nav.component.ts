import { Component, OnInit, OnDestroy, HostListener, Renderer2 } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router'; // <-- Add this
import { AdminSearchService } from '../../services/admin-search.service';

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.css']
})
export class AdminNavComponent implements OnInit, OnDestroy {
  private sidebarSubscription!: Subscription;
  public isMobile = false;
  private mobileBreakpoint = 768;
  private readonly NAVBAR_HEIGHT = 56; // Match this with your navbar height
  searchTerm: string = '';
  public showHelpModal = false;

  constructor(
    public sidebarService: SidebarService,
    private renderer: Renderer2,
    private router: Router,
    private adminSearchService: AdminSearchService // <-- Add this
  ) {
    this.checkScreenSize();
  }

  ngOnInit() {
    // Set initial body padding
    this.setBodyPadding();
    
    this.sidebarSubscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      if (this.isMobile) {
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
      }
      // Update padding when sidebar changes
      this.setBodyPadding();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
    this.setBodyPadding();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < this.mobileBreakpoint;
    if (this.isMobile) {
      this.sidebarService.close();
    } else {
      this.sidebarService.open();
    }
  }

  private setBodyPadding() {
    // Use Renderer2 for safer DOM manipulation
    const paddingTop = `${this.NAVBAR_HEIGHT + 20}px`; // 20px additional padding
    this.renderer.setStyle(document.body, 'padding-top', paddingTop);
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  confirmLogout(event: Event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      // Perform logout logic here (clear tokens, etc.)
      this.router.navigate(['/']); // Redirect to homepage
    }
  }

  onSearchChange() {
    this.adminSearchService.setSearchTerm(this.searchTerm);
  }

  ngOnDestroy() {
    this.sidebarSubscription?.unsubscribe();
    document.body.style.overflow = 'auto';
    // Clean up the padding when component is destroyed
    this.renderer.removeStyle(document.body, 'padding-top');
  }
}
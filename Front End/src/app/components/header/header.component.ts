import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;
  dropdownOpen = false;
  isMobile = window.innerWidth <= 768;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.menuOpen = false;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(event: Event) {
    event.preventDefault(); // Prevent default to avoid unwanted behavior
    this.dropdownOpen = !this.dropdownOpen;
  }

  showSubmenu() {
    this.dropdownOpen = true;
  }

  hideSubmenu() {
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeMenus(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('nav') || target.classList.contains('dashboard-link')) {
      return;
    }
    this.dropdownOpen = false;
  }
}

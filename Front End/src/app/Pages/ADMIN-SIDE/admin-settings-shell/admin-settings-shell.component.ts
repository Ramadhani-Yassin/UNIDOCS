import { Component } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-admin-settings-shell',
  templateUrl: './admin-settings-shell.component.html',
  styleUrls: ['./admin-settings-shell.component.css']
})
export class AdminSettingsShellComponent {
  constructor(public sidebarService: SidebarService) {}
}

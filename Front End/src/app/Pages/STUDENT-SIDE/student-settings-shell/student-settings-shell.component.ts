import { Component } from '@angular/core';
import { StudentSidebarService } from '../../../services/student-sidebar.service';

@Component({
  selector: 'app-student-settings-shell',
  templateUrl: './student-settings-shell.component.html',
  styleUrls: ['./student-settings-shell.component.css']
})
export class StudentSettingsShellComponent {
  constructor(public sidebarService: StudentSidebarService) {}
}

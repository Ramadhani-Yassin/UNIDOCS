import { Component } from '@angular/core';
import { StudentSidebarService } from '../../../services/student-sidebar.service';

@Component({
  selector: 'app-cv-generator',
  templateUrl: './cv-generator.component.html',
  styleUrls: ['./cv-generator.component.css']
})
export class CVGeneratorComponent {
  constructor(public sidebarService: StudentSidebarService) {}
}

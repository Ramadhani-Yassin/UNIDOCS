import { Component } from '@angular/core';

@Component({
  selector: 'app-Dashboard',
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.css']
})
export class DashboardComponent {
  status = false;
  addToggle()
{
  this.status = !this.status;       
}
}
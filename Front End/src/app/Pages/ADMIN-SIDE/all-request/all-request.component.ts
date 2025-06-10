import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { AdminLetterService } from '../../../services/admin-letter.service';

@Component({
  selector: 'app-all-request',
  templateUrl: './all-request.component.html',
  styleUrls: ['./all-request.component.css']
})
export class AllRequestComponent implements OnInit {
  letterRequests: any[] = [];
  statuses = ['PENDING', 'APPROVED', 'DECLINED'];
  editingStatusIndex: number | null = null;

  constructor(
    public sidebarService: SidebarService,
    private adminLetterService: AdminLetterService
  ) {}

  ngOnInit() {
    this.loadLetterRequests();
  }

  loadLetterRequests() {
    this.adminLetterService.getAll().subscribe(data => {
      this.letterRequests = data;
    });
  }

  updateStatus(request: any) {
    this.adminLetterService.updateStatus(request.id, request.status, request.adminComment || '').subscribe(() => {
      this.loadLetterRequests();
    });
  }

  setEditingStatus(idx: number) {
    this.editingStatusIndex = idx;
  }

  saveStatus(request: any, idx: number) {
    this.updateStatus(request);
    this.editingStatusIndex = null;
  }
}

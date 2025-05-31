import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSettingsShellComponent } from './admin-settings-shell.component';

describe('AdminSettingsShellComponent', () => {
  let component: AdminSettingsShellComponent;
  let fixture: ComponentFixture<AdminSettingsShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminSettingsShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSettingsShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

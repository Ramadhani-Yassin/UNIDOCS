import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPortalComponent } from './admin-portal.component';

describe('AdminPortalComponent', () => {
  let component: AdminPortalComponent;
  let fixture: ComponentFixture<AdminPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPortalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

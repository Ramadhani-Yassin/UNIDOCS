import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAnnouncementsComponent } from './manage-announcements.component';

describe('ManageAnnouncementsComponent', () => {
  let component: ManageAnnouncementsComponent;
  let fixture: ComponentFixture<ManageAnnouncementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageAnnouncementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAnnouncementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

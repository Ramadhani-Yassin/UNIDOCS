import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishAnnouncementsComponent } from './publish-announcements.component';

describe('PublishAnnouncementsComponent', () => {
  let component: PublishAnnouncementsComponent;
  let fixture: ComponentFixture<PublishAnnouncementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublishAnnouncementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishAnnouncementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

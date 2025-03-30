import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsManagementComponent } from './students-management.component';

describe('StudentsManagementComponent', () => {
  let component: StudentsManagementComponent;
  let fixture: ComponentFixture<StudentsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentsManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

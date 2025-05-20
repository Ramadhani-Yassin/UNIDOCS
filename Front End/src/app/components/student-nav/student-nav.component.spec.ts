import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentNavComponent } from './student-nav.component';

describe('StudentNavComponent', () => {
  let component: StudentNavComponent;
  let fixture: ComponentFixture<StudentNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentNavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSettingsShellComponent } from './student-settings-shell.component';

describe('StudentSettingsShellComponent', () => {
  let component: StudentSettingsShellComponent;
  let fixture: ComponentFixture<StudentSettingsShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentSettingsShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSettingsShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

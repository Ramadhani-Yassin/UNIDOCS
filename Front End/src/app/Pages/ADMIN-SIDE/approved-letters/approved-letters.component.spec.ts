import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedLettersComponent } from './approved-letters.component';

describe('ApprovedLettersComponent', () => {
  let component: ApprovedLettersComponent;
  let fixture: ComponentFixture<ApprovedLettersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovedLettersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedLettersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersRequestedComponent } from './letters-requested.component';

describe('LettersRequestedComponent', () => {
  let component: LettersRequestedComponent;
  let fixture: ComponentFixture<LettersRequestedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LettersRequestedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LettersRequestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

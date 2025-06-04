import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CVGeneratorComponent } from './cv-generator.component';

describe('CVGeneratorComponent', () => {
  let component: CVGeneratorComponent;
  let fixture: ComponentFixture<CVGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CVGeneratorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CVGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

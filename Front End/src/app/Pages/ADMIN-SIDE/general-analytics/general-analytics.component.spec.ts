import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralAnalyticsComponent } from './general-analytics.component';

describe('GeneralAnalyticsComponent', () => {
  let component: GeneralAnalyticsComponent;
  let fixture: ComponentFixture<GeneralAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Dashboard.component.spec.ts
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DashboardComponent } from './Dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dashboard content', () => {
    const dashboardContent = fixture.nativeElement.querySelector('.dashboard-content');
    expect(dashboardContent).toBeTruthy();
  });
});
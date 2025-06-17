import { Component, OnInit } from '@angular/core';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { LetterRequestService } from '../../../services/letter-request.service';
import { UserService } from '../../../services/user.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  selectedDateRange: string = '30';
  analyticsData: any;
  recentRequests: any[] = [];
  letterTypes: string[] = [];
  topPrograms: string[] = [];

  // Chart data
  public letterTypeChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 4
    }]
  };

  public statusChartData: ChartData<'pie'> = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#52c41a', '#faad14', '#ff4d4f'],
      hoverOffset: 4
    }]
  };

  public timeSeriesChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Requests',
      data: [],
      fill: true,
      backgroundColor: 'rgba(24, 144, 255, 0.2)',
      borderColor: '#1890ff',
      tension: 0.4
    }]
  };

  public approvalTimeChartData: ChartData<'bar'> = {
    labels: ['<1 day', '1-2 days', '3-5 days', '6-10 days', '>10 days'],
    datasets: [{
      label: 'Requests',
      data: [0, 0, 0, 0, 0],
      backgroundColor: '#1890ff'
    }]
  };

  public programChartData: ChartData<'polarArea'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 4
    }]
  };

  // Chart options
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public polarAreaChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  constructor(
    public sidebarService: StudentSidebarService,
    private letterRequestService: LetterRequestService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    const user = this.userService.getCurrentUser();
    if (!user || !user.email) {
      this.analyticsData = {};
      this.recentRequests = [];
      return;
    }

    this.letterRequestService.getUserAnalytics(user.email, this.selectedDateRange).subscribe({
      next: (data: any) => {
        // Convert objects to arrays for charting
        data.letterTypeDistribution = this.objectToArray(data.letterTypeDistribution, 'type', 'count');
        data.programDistribution = this.objectToArray(data.programDistribution, 'program', 'count');
        // Convert date arrays in recentRequests
        if (Array.isArray(data.recentRequests)) {
          data.recentRequests = data.recentRequests.map((req: any) => ({
            ...req,
            requestDate: this.arrayDateToString(req.requestDate)
          }));
        }
        this.analyticsData = data;
        this.recentRequests = data.recentRequests || [];
        this.letterTypes = data.letterTypeDistribution.map((item: any) => item.type) || [];
        this.topPrograms = data.programDistribution.map((item: any) => item.program) || [];
        this.updateCharts();
      },
      error: (err: any) => {
        console.error('Failed to load analytics data:', err);
      }
    });
  }

  updateCharts(): void {
    // Letter Type Distribution
    this.letterTypeChartData = {
      labels: this.analyticsData.letterTypeDistribution.map((item: any) => item.type),
      datasets: [{
        data: this.analyticsData.letterTypeDistribution.map((item: any) => item.count),
        backgroundColor: this.analyticsData.letterTypeDistribution.map((item: any, index: number) => 
          this.getColorForLetterType(item.type, index)
        ),
        hoverOffset: 4
      }]
    };

    // Status Distribution
    this.statusChartData = {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        data: [
          this.analyticsData.statusDistribution.approved || 0,
          this.analyticsData.statusDistribution.pending || 0,
          this.analyticsData.statusDistribution.rejected || 0
        ],
        backgroundColor: ['#52c41a', '#faad14', '#ff4d4f'],
        hoverOffset: 4
      }]
    };

    // Time Series
    this.timeSeriesChartData = {
      labels: this.analyticsData.timeSeries.map((item: any) => item.date),
      datasets: [{
        label: 'Requests',
        data: this.analyticsData.timeSeries.map((item: any) => item.count),
        fill: true,
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        borderColor: '#1890ff',
        tension: 0.4
      }]
    };

    // Approval Time
    this.approvalTimeChartData = {
      labels: ['<1 day', '1-2 days', '3-5 days', '6-10 days', '>10 days'],
      datasets: [{
        label: 'Requests',
        data: [
          this.analyticsData.approvalTimeDistribution.lessThan1Day || 0,
          this.analyticsData.approvalTimeDistribution.oneToTwoDays || 0,
          this.analyticsData.approvalTimeDistribution.threeToFiveDays || 0,
          this.analyticsData.approvalTimeDistribution.sixToTenDays || 0,
          this.analyticsData.approvalTimeDistribution.moreThan10Days || 0
        ],
        backgroundColor: '#1890ff'
      }]
    };

    // Program Distribution
    this.programChartData = {
      labels: this.analyticsData.programDistribution.map((item: any) => item.program),
      datasets: [{
        data: this.analyticsData.programDistribution.map((item: any) => item.count),
        backgroundColor: this.analyticsData.programDistribution.map((item: any, index: number) => 
          this.getColorForProgram(item.program, index)
        ),
        hoverOffset: 4
      }]
    };
  }

  onDateRangeChange(): void {
    this.loadAnalyticsData();
  }

  getPercentageChange(type: string): string {
    if (!this.analyticsData?.percentageChanges) return '0';
    
    const change = this.analyticsData.percentageChanges[type];
    if (change === undefined) return '0';
    
    return change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
  }

  getColorForLetterType(type: string, index?: number): string {
    const colors = [
      '#1890ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d',
      '#722ed1', '#eb2f96', '#fa8c16', '#a0d911', '#1890ff'
    ];
    
    return index !== undefined ? colors[index % colors.length] : colors[0];
  }

  getColorForProgram(program: string, index?: number): string {
    const colors = [
      '#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40', '#9966FF',
      '#FFCD56', '#C9CBCF', '#8AC24A', '#00BCD4', '#FF5722'
    ];
    
    return index !== undefined ? colors[index % colors.length] : colors[0];
  }

  // Helper: Convert object to array for charting
  objectToArray(obj: any, keyName: string, valueName: string) {
    if (!obj) return [];
    return Object.keys(obj).map(key => ({
      [keyName]: key,
      [valueName]: obj[key]
    }));
  }

  // Helper: Convert array date to string
  arrayDateToString(date: any): string {
    if (Array.isArray(date) && date.length >= 6) {
      const jsDate = new Date(
        date[0], date[1] - 1, date[2], date[3], date[4], date[5], Math.floor(date[6] / 1000000)
      );
      return jsDate.toLocaleString();
    }
    if (typeof date === 'string') {
      return new Date(date).toLocaleString();
    }
    return '-';
  }
}
import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service'; // Use the correct SidebarService here
import { LetterRequestService } from '../../../services/letter-request.service';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-general-analytics',
  templateUrl: './general-analytics.component.html',
  styleUrls: ['./general-analytics.component.css']
})
export class GeneralAnalyticsComponent implements OnInit {
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
    public sidebarService: SidebarService,
    private letterRequestService: LetterRequestService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
    // Optional: For debugging
    this.sidebarService.isOpen$.subscribe(isOpen => {
      console.log('Sidebar state:', isOpen);
    });
  }

  loadAnalyticsData(): void {
    this.letterRequestService.getGeneralAnalytics(this.selectedDateRange).subscribe({
      next: (data: any) => {
        // Convert objects to arrays for charting if needed
        data.letterTypeDistribution = this.objectToArray(data.letterTypeDistribution, 'type', 'count');
        data.programDistribution = this.objectToArray(data.programDistribution, 'program', 'count');
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

  // Helper to convert object to array
  objectToArray(obj: any, keyName: string, valueName: string) {
    if (!obj) return [];
    return Object.keys(obj).map(key => ({
      [keyName]: key,
      [valueName]: obj[key]
    }));
  }

  updateCharts(): void {
    // Letter Type Distribution
    const letterTypeDist = this.analyticsData.letterTypeDistribution || [];
    this.letterTypeChartData = {
      labels: letterTypeDist.map((item: any) => item.type),
      datasets: [{
        data: letterTypeDist.map((item: any) => item.count),
        backgroundColor: letterTypeDist.map((item: any, index: number) =>
          this.getColorForLetterType(item.type, index)
        ),
        hoverOffset: 4
      }]
    };

    // Status Distribution
    const statusDist = this.analyticsData.statusDistribution || {};
    this.statusChartData = {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        data: [
          statusDist.approved || 0,
          statusDist.pending || 0,
          statusDist.rejected || 0
        ],
        backgroundColor: ['#52c41a', '#faad14', '#ff4d4f'],
        hoverOffset: 4
      }]
    };

    // Program Distribution
    const programDist = this.analyticsData.programDistribution || [];
    this.programChartData = {
      labels: programDist.map((item: any) => item.program),
      datasets: [{
        data: programDist.map((item: any) => item.count),
        backgroundColor: programDist.map((item: any, index: number) =>
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

  formatDate(date: any): string {
    try {
      if (Array.isArray(date) && date.length >= 6) {
        const jsDate = new Date(
          date[0], date[1] - 1, date[2], date[3], date[4], date[5], Math.floor(date[6] / 1000000)
        );
        return jsDate.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(/\//g, '-');
      }
      if (typeof date === 'string') {
        if (date && !date.endsWith('Z') && !date.includes('+')) {
          date = date + 'Z';
        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return date;
        }
        return parsedDate.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(/\//g, '-');
      }
      return '-';
    } catch {
      return '-';
    }
  }
}
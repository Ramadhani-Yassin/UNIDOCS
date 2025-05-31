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
    // Mock data - replace with actual API call
    this.analyticsData = {
      totalRequests: 125,
      approvedRequests: 85,
      pendingRequests: 25,
      rejectedRequests: 15,
      percentageChanges: {
        total: 12.5,
        approved: 8.2,
        pending: -3.1,
        rejected: 5.3
      },
      letterTypeDistribution: [
        { type: 'Introduction', count: 45 },
        { type: 'Postponement', count: 30 },
        { type: 'Feasibility', count: 25 },
        { type: 'Discontinuation', count: 15 },
        { type: 'Recommendation', count: 10 }
      ],
      statusDistribution: {
        approved: 85,
        pending: 25,
        rejected: 15
      },
      timeSeries: [
        { date: '2023-01-01', count: 5 },
        { date: '2023-01-02', count: 8 },
        { date: '2023-01-03', count: 12 },
        { date: '2023-01-04', count: 7 },
        { date: '2023-01-05', count: 15 }
      ],
      approvalTimeDistribution: {
        lessThan1Day: 40,
        oneToTwoDays: 25,
        threeToFiveDays: 15,
        sixToTenDays: 5,
        moreThan10Days: 0
      },
      programDistribution: [
        { program: 'BITA', count: 45 },
        { program: 'BIT', count: 30 },
        { program: 'BIS', count: 25 },
        { program: 'BCS', count: 15 },
        { program: 'BSE', count: 10 }
      ],
      recentRequests: [
        { id: 1001, studentName: 'John Doe', letterType: 'Introduction', requestDate: '2023-01-01', status: 'Approved', approvalTime: '1 day' },
        { id: 1002, studentName: 'Jane Smith', letterType: 'Postponement', requestDate: '2023-01-02', status: 'Pending' },
        { id: 1003, studentName: 'Mike Johnson', letterType: 'Feasibility', requestDate: '2023-01-03', status: 'Rejected' }
      ]
    };

    this.recentRequests = this.analyticsData.recentRequests;
    this.letterTypes = this.analyticsData.letterTypeDistribution.map((item: any) => item.type);
    this.topPrograms = this.analyticsData.programDistribution.map((item: any) => item.program);

    this.updateCharts();
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
}
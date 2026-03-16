import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardService, SystemStats, MonthlyRegistration } from '../../core/services/dashboardService';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, BaseChartDirective, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);

  stats: SystemStats = {
    totalAccounts: 0,
    globalBalance: 0,
    averageBalance: 0,
    calculationDate: new Date().toISOString()
  };

  isLoading = true;

  // --- Doughnut Chart ---
  public doughnutData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Average Balance', 'Remaining'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        'rgba(99, 102, 241, 0.85)',
        'rgba(226, 232, 240, 0.5)',
      ],
      hoverBackgroundColor: [
        'rgba(79, 70, 229, 1)',
        'rgba(203, 213, 225, 0.7)',
      ],
      borderWidth: 0,
      borderRadius: 6,
      spacing: 4,
    }]
  };

  public doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 13, weight: 'bold' },
          color: '#64748b',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 14,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            return ` $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          }
        }
      }
    }
  };

  // --- Line Chart ---
  public lineData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'New Customers',
      fill: true,
      tension: 0.4,
      borderColor: 'rgba(99, 102, 241, 1)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 3,
    }]
  };

  public lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 12, weight: 'bold' }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 12, weight: 'bold' },
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 13, weight: 'bold' },
          color: '#64748b',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 14,
        cornerRadius: 12,
      }
    }
  };

  ngOnInit() {
    this.loadStats();
    this.loadMonthlyData();
  }

  loadStats() {
    this.isLoading = true;
    this.dashboardService.getSystemStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.updateDoughnut(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Dashboard verileri yüklenemedi:', err);
        this.isLoading = false;
      }
    });
  }

  loadMonthlyData() {
    this.dashboardService.getMonthlyRegistrations(6).subscribe({
      next: (data) => {
        this.lineData = {
          labels: data.map(d => d.month),
          datasets: [{
            data: data.map(d => d.count),
            label: 'New Customers',
            fill: true,
            tension: 0.4,
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
          }]
        };
      },
      error: (err) => console.error('Monthly data failed:', err)
    });
  }

  private updateDoughnut(data: SystemStats) {
    const avg = data.averageBalance;
    const remaining = data.globalBalance - avg;

    this.doughnutData = {
      labels: ['Average Balance', 'Remaining Total'],
      datasets: [{
        data: [avg, remaining > 0 ? remaining : 0],
        backgroundColor: [
          'rgba(99, 102, 241, 0.85)',
          'rgba(16, 185, 129, 0.6)',
        ],
        hoverBackgroundColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(5, 150, 105, 0.85)',
        ],
        borderWidth: 0,
        borderRadius: 6,
        spacing: 4,
      }]
    };
  }
}
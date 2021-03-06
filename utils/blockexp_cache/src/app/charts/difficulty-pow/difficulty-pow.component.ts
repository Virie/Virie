import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Chart} from 'angular-highcharts';
import {HttpService, MobileNavState} from '../../http.service';
import * as moment from 'moment';

@Component({
  selector: 'app-difficulty-pow',
  templateUrl: './difficulty-pow.component.html',
  styleUrls: ['./difficulty-pow.component.scss']
})
export class DifficultyPowComponent implements OnInit, OnDestroy {
  navIsOpen: boolean;
  searchIsOpen: boolean;
  activeChart: string;
  powDifficulty: any;
  chartSubscription: Subscription;
  difficultyChart: Chart;
  seriesData: any;
  loader: boolean;
  options: any = {
    timepicker: false,
    format12h: false,
    language: 'en-short'
  };
  date: Date = new Date;
  startDate: any;
  endDate: any;
  datepickerFrom: boolean;
  datepickerTo: boolean;
  btnActive: string;

  static drawChart(activeChart, titleText, yText, chartsData): Chart {
    return new Chart({
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        height: 700,
        width: null,
        zoomType: 'x',
        animation: false,
        ignoreHiddenSeries: true,
        resetZoomButton: {
          theme: {
            display: 'none',
          },
        },
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500,
          },
          height: 500,
          chartOptions: {
            title: {
              margin: 50
            },
            rangeSelector: {
              enabled: false,
              inputEnabled: false,
            },
            yAxis: {
              labels: {
                align: 'left',
                x: 0,
                y: -5
              },
            },
          }
        }]
      },
      boost: {
        enabled: true,
        useGPUTranslations: true,
        usePreallocated: true,
      },
      title: {
        text: '',
      },
      credits: {enabled: false},
      exporting: {enabled: false},
      legend: {
        enabled: false,
        itemStyle: {
          color: '#5d6c78',
          fontFamily: 'Helvetica',
        },
        itemHoverStyle: {
          color: '#5d6c78'
        }
      },
      tooltip: {
        enabled: true,

        valueDecimals: 0,
        xDateFormat: '%Y/%m/%d %H:%M',

        pointFormatter: function () {
          const point = this;
          return '<b style="color:' + point.color + '">\u25CF</b> ' + point.series.name + ': <b>' + (point.y) + '</b><br/>';
        },
        crosshairs: true,
        shared: true,
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: []
          },
          marker: {
            radius: 2
          },
          lineWidth: 2,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        }
      },
      xAxis: {
        type: 'datetime',
        labels: {
          style: {
            color: '#5d6c78',
            fontSize: '11px'
          },
          format: '{value:%d.%b}'
        },
      },
      yAxis: {
        floor: 0,
        title: {
          text: yText,
          style: {
            color: '#5d6c78'
          }
        },
        labels: {
          style: {
            color: '#5d6c78',
            fontSize: '11px'
          },
        },
      },
      navigator: {enabled: true},
      series: chartsData
    });
  }


  onIsVisible($event): void {
    this.searchIsOpen = $event;
  }

  dateChanged(date) {
    this.btnActive = 'inputs';
    return moment.utc(date).unix();
  }

  @HostListener('document:click', ['$event']) onClick(event: any) {
    if (this.datepickerFrom === true || this.datepickerTo === true) {
      if (event.target && event.target.className && event.target.className.indexOf('air-input') === -1) {
        if (event.target.className.indexOf('-other-month-') > -1) {
          return;
        }
        const target = event.target.closest('air-datepicker');

        if (target === null) {
          const air = document.querySelector('air-datepicker');
          if (air !== null) {
            if (this.datepickerFrom) {
              this.datepickerFrom = false;
            }
            if (this.datepickerTo) {
              this.datepickerTo = false;
            }
          }
        } else {
          if (this.datepickerFrom === true) {
            this.datepickerFrom = false;
          }
          if (this.datepickerTo === true) {
            this.datepickerTo = false;
          }
        }
      }
    }
  }


  constructor(private httpService: HttpService, private mobileNavState: MobileNavState) {
    this.navIsOpen = false;
    this.searchIsOpen = false;
    this.activeChart = 'pow-difficulty';
    this.btnActive = 'week';
    this.startDate = moment.utc(this.startDate).unix();
    this.endDate = moment.utc(this.date).add(-1, 'week').unix(); // week
    this.datepickerFrom = false;
    this.datepickerTo = false;
  }

  ngOnInit() {
    this.mobileNavState.change.subscribe(navIsOpen => {
      this.navIsOpen = navIsOpen;
    });
    this.initialChart();
  }


  initialChart() {
    this.loader = true;
    if (this.chartSubscription) {
      this.chartSubscription.unsubscribe();
    }
    this.chartSubscription = this.httpService.getChart(this.activeChart, this.startDate, this.endDate).subscribe(data => {
        this.powDifficulty = data;
        const powDifficultyArray = [];
        for (let i = 1; i < this.powDifficulty.length; i++) {
          powDifficultyArray.push([this.powDifficulty[i].at * 1000, parseInt(this.powDifficulty[i].d, 10)]);
        }
        this.difficultyChart = DifficultyPowComponent.drawChart(
          false,
          '',
          'PoW Difficulty',
          this.seriesData = [
            {type: 'area', name: 'PoW difficulty', data: powDifficultyArray},
          ]
        );
      }, err => console.log(err),
      () => {
        this.loader = false;
      }
    );
  }

  setPeriod(period: string) {
    this.startDate = moment();
    this.endDate = period;

    switch (this.endDate) {
      case 'day':
        this.endDate = moment.utc(this.startDate).add(-24, 'hours').unix();
        this.btnActive = 'day';
        break;
      case 'week':
        this.endDate = moment.utc(this.startDate).add(-1, 'week').unix();
        this.btnActive = 'week';
        break;
      case 'month':
        this.endDate = moment.utc(this.startDate).add(-1, 'month').unix();
        this.btnActive = 'month';
        break;
      case 'quarter':
        this.endDate = moment.utc(this.startDate).add(-3, 'month').unix();
        this.btnActive = 'quarter';
        break;
      case 'year':
        this.endDate = moment.utc(this.startDate).add(-1, 'year').unix();
        this.btnActive = 'year';
        break;
      case 'all':
        this.endDate = 0;
        this.btnActive = 'all';
        break;
      default:
        this.endDate = moment.utc(this.startDate).add(-1, 'week').unix();
        this.btnActive = 'week';
        break
    }
    this.startDate = moment.utc(this.startDate).unix();
    this.initialChart();
  }


  ngOnDestroy() {
    if (this.chartSubscription) {
      this.chartSubscription.unsubscribe();
    }
  }
}

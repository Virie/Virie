import {Component, OnInit, OnDestroy} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {HttpService, MobileNavState} from '../http.service';
import {Subscription} from 'rxjs/Subscription';
import * as moment from 'moment';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, OnDestroy {
  navIsOpen: boolean;
  activeChart: string;
  loader: boolean;
  searchIsOpen: boolean;

  previewAvgBlockSizeChart: Chart;
  previewAvgTransPerBlockChart: Chart;
  previewHashRateChart: Chart;
  previewDifficultyPoSChart: Chart;
  previewDifficultyPoWChart: Chart;
  previewConfirmTransactPerDayChart: Chart;
  previewDensityPoWChart: Chart;
  previewDensityPoSChart: Chart;
  previewDensityBlocksChart: Chart;

  chartSubscription: Subscription;
  seriesData: any;

  chartsData: any;
  confirmTransactData: any;
  hashrateData: any;
  densityPowData: any;
  densityPosData: any;
  densityBlocksData: any;
  startDate: any;
  endDate: any;


  static drawChart(activeChart, titleText, yText, chartsData): Chart {
    return new Chart({
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        height: 280,
        zoomType: 'x',
        animation: false,
        ignoreHiddenSeries: true,
        resetZoomButton: {
          theme: {
            display: 'none',
          },
        },
      },
      boost: {
        enabled: true,
        useGPUTranslations: true,
        usePreallocated: true,
      },
      title: {
        text: null,
        style: {
          color: '#fff',
          fontSize: '14px',
        }
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
        enabled: false
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
          lineWidth: activeChart === true ? 1 : 2,
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
          text: null,
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
      navigator: false,
      rangeSelector: {
        enabled: yText !== 'Transactions',
        buttons: [{
          type: 'day',
          count: 1,
          text: 'day'
        }],
        selected: 0,
        inputEnabled: false
      },
      series: chartsData
    });
  }

  onIsVisible($event): void {
    this.searchIsOpen = $event;
  }

  constructor(
    private httpService: HttpService,
    private mobileNavState: MobileNavState) {
    this.navIsOpen = false;
    this.loader = true;
    this.searchIsOpen = false;
    this.activeChart = 'preview';
    this.startDate = moment();
    this.endDate = moment.utc(this.startDate).add(-24, 'hours').unix(); // 'day'
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
        this.chartsData = data;
        this.confirmTransactData = data[0];
        this.hashrateData = data[1];
        this.densityPowData = data[2];
        this.densityPosData = data[3];
        this.densityBlocksData = data[4];

        const previewAvgBlockSize = [];
        const previewAvgTransPerBlock = [];
        const previewDifficultyPoS = [];
        const previewDifficultyPoW = [];
        const previewHashrate100 = [];
        const previewConfirmTransactPerDay = [];
        const previewDensityPoWChart = [];
        const previewDensityPoSChart = [];
        const previewDensityBlocksChart = [];

        // AvgBlockSize, AvgTransPerBlock
        for (let i = 0; i < this.chartsData.length; i++) {
          previewAvgBlockSize.push([this.chartsData[i].at * 1000, this.chartsData[i].bcs]);
          previewAvgTransPerBlock.push([this.chartsData[i].at * 1000, this.chartsData[i].trc]);
        }

        // ConfirmTransactPerDay
        for (let i = 1; i < this.confirmTransactData.length; i++) {
          previewConfirmTransactPerDay.push([this.confirmTransactData[i].at * 1000, parseInt(this.confirmTransactData[i].sum_trc, 10)]);
        }

        // Difficulty (PoS/PoW)
        for (let i = 0; i < this.chartsData.length; i++) {
          if (this.chartsData[i].t === 0) {
            previewDifficultyPoS.push([this.chartsData[i].at * 1000, parseInt(this.chartsData[i].d, 10)]);
          }
          if (this.chartsData[i].t === 1) {
            previewDifficultyPoW.push([this.chartsData[i].at * 1000, parseInt(this.chartsData[i].d, 10)]);
          }
        }

        // hashRate
        for (let i = 0; i < this.hashrateData.length; i++) {
          previewHashrate100.push([this.hashrateData[i].at * 1000, parseInt(this.hashrateData[i].h100, 10)]);
        }

        // DensityPoW
        for (let i = 1; i < this.densityPowData.length; i++) {
          previewDensityPoWChart.push([this.densityPowData[i].at * 1000, this.densityPowData[i].blocksCount]);
        }

        // DensityPoS
        for (let i = 1; i < this.densityPosData.length; i++) {
          previewDensityPoSChart.push([this.densityPosData[i].at * 1000, this.densityPosData[i].blocksCount]);
        }

        // DensityBlocks
        for (let i = 1; i < this.densityBlocksData.length; i++) {
          previewDensityBlocksChart.push([this.densityBlocksData[i].at * 1000, this.densityBlocksData[i].blocksCount]);
        }

        this.previewAvgBlockSizeChart = ChartsComponent.drawChart(
          true,
          'Average Block Size',
          'MB',
          this.seriesData = [
            {type: 'area', name: 'MB', data: previewAvgBlockSize}
          ]
        );
        this.previewAvgTransPerBlockChart = ChartsComponent.drawChart(
          true,
          'Average Number Of Transactions Per Block',
          'Transaction Per Block',
          this.seriesData = [
            {type: 'area', name: 'Transaction Per Block', data: previewAvgTransPerBlock}
          ]
        );
        this.previewDifficultyPoWChart = ChartsComponent.drawChart(
          true,
          'PoW Difficulty',
          'PoW Difficulty',
          this.seriesData = [
            {
              type: 'area', name: 'PoW difficulty', data: previewDifficultyPoW
            }
          ]
        );
        this.previewDifficultyPoSChart = ChartsComponent.drawChart(
          true,
          'PoS Difficulty',
          'PoS Difficulty',
          this.seriesData = [
            {
              type: 'area', name: 'PoS difficulty', data: previewDifficultyPoS,
            }
          ]
        );
        this.previewHashRateChart = ChartsComponent.drawChart(
          true,
          'Hash Rate',
          'Hash Rate H/s',
          this.seriesData = [
            {type: 'area', name: 'Hash Rate', data: previewHashrate100},
          ]
        );
        this.previewConfirmTransactPerDayChart = ChartsComponent.drawChart(
          true,
          'Confirmed Transactions Per Day',
          'Transactions',
          this.seriesData = [
            {type: 'area', name: 'Transactions', data: previewConfirmTransactPerDay}
          ]
        );
        this.previewDensityPoWChart = ChartsComponent.drawChart(
          true,
          'PoW Blocks Density',
          'Blocks',
          this.seriesData = [
            {type: 'area', name: 'Blocks', data: previewDensityPoWChart}
          ]
        );
        this.previewDensityPoSChart = ChartsComponent.drawChart(
          true,
          'PoS Blocks Density',
          'Blocks',
          this.seriesData = [
            {type: 'area', name: 'Blocks', data: previewDensityPoSChart}
          ]
        );
        this.previewDensityBlocksChart = ChartsComponent.drawChart(
          true,
          'Blocks Density',
          'Blocks',
          this.seriesData = [
            {type: 'area', name: 'Blocks', data: previewDensityBlocksChart}
          ]
        );
      }, err => console.log('error chart', err),
      () => {
        this.loader = false;
      });
  }

  ngOnDestroy() {
    if (this.chartSubscription) {
      this.chartSubscription.unsubscribe();
    }
  }

}

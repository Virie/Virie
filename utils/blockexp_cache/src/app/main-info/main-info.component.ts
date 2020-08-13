import {Component, ViewEncapsulation, OnInit, OnDestroy} from '@angular/core';
import {HttpService} from '../http.service';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-main-info',
  templateUrl: './main-info.component.html',
  styleUrls: ['./main-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [],
})
export class MainInfoComponent implements OnInit, OnDestroy {
  info: any;
  height: number;
  posDifficulty: number;
  powDifficulty: number;
  totalCoins: number;
  NetworkHashrate: number;
  txCount: number;
  getInfoSubscription: Subscription;

  constructor(private httpService: HttpService, private route: ActivatedRoute) {
  }

  getInfoPrepare(data) {
    this.info = data;
    if (this.info) {
      this.height = this.info.height;
      this.posDifficulty = this.info.pos_difficulty;
      this.powDifficulty = this.info.pow_difficulty;
      this.totalCoins = this.info.total_coins;
      this.txCount = this.info.tx_count;
      this.NetworkHashrate = this.info.current_network_hashrate_350;
    }

  }

  ngOnInit() {
    this.getInfoPrepare(this.route.snapshot.data['MainInfo']);
    this.getInfoSubscription = this.httpService.subscribeInfo().subscribe(
      data => {
        this.getInfoPrepare(data);
      },
      err => {
        console.log(err);
      }
    );

  }

  ngOnDestroy() {
    if (this.getInfoSubscription) {
      this.getInfoSubscription.unsubscribe();
    }
  }
}



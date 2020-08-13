import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpService, MobileNavState} from '../http.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import JSONbig from 'json-bigint';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  providers: [],
})
export class TransactionComponent implements OnInit, OnDestroy {
  Transaction: any = {};
  tx_hash: any;
  keeperBlock: number;
  ExtraItem: any;
  info: any;
  height: number;
  posDifficulty: number;
  powDifficulty: number;
  totalCoins: number;
  NetworkHashrate: number;
  showDialogMixinCount = false;
  currentIndex: any;
  Inputs: any;
  connection;
  i: any;
  mixinCount;
  ConnectTransaction: any;
  link;
  Outputs: any[];
  unconfirmed: boolean;
  inputsLimit = 10;
  outputsLimit = 10;
  routeSubscription: Subscription;
  getTransactionSubscription: Subscription;
  getInfoSubscription: Subscription;
  getConnectTransactSubscription: Subscription;
  getMixinCountSubscription: Subscription;
  getGlobalIndexSubscription: Subscription;
  blockHash: any;
  blockTimestamp: number;
  attachments: any;
  txCount: number;
  transactionNotFount: boolean;
  navBlockchain: any;
  navBlockchainMobile: any;

  navIsOpen: boolean;
  searchIsOpen: boolean;

  onIsVisible($event): void {
    this.searchIsOpen = $event;
  }

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private router: Router,
    private mobileNavState: MobileNavState) {
    this.transactionNotFount = false;
    this.navBlockchain = document.getElementById('blockchain-li');
    this.navBlockchainMobile = document.getElementById('blockchain-mobile-li');
    this.navIsOpen = false;
    this.searchIsOpen = false;
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
    this.navBlockchain.classList.add('active');
    this.navBlockchainMobile.classList.add('active');
    this.getInfoPrepare(this.route.snapshot.data['MainInfo']);

    const self = this;
    this.routeSubscription = this.route.params.subscribe(params => {
      this.tx_hash = params['tx_hash'];
      this.getTransactionSubscription = this.httpService.getTransaction(params.tx_hash).subscribe(
        data => {
          this.Transaction = data;
          this.keeperBlock = this.Transaction.keeper_block;
          if (this.keeperBlock >= 0) {
            // transaction confirmed
            this.unconfirmed = false;
            this.blockHash = this.Transaction.block_hash;
            this.blockTimestamp = this.Transaction.block_timestamp;

            this.ExtraItem = JSON.parse(this.Transaction.extra);
            this.Inputs = JSONbig.parse(this.Transaction.ins);
            this.Outputs = JSONbig.parse(this.Transaction.outs);

            if (this.Transaction.attachments) {
              this.attachments = JSON.parse(this.Transaction.attachments);
            }
          } else if (this.keeperBlock === -1) {
            // transaction unconfirmed
            this.unconfirmed = true;
            this.ExtraItem = this.Transaction.extra;
            this.Inputs = this.Transaction.ins;
            this.Outputs = this.Transaction.outs;
          } else {
            this.router.navigate(['/'], {relativeTo: this.route});
          }
        }, () => this.transactionNotFount = true
      )
    });

    this.getInfoSubscription = this.httpService.subscribeInfo().subscribe((data) => {
      this.getInfoPrepare(data);
    });
    this.mobileNavState.change.subscribe(navIsOpen => {
      this.navIsOpen = navIsOpen;
    });
  }


  // Get Connect Transaction
  getConnectTransaction = (connection) => {
    this.connection = connection;
    this.i = 1;
    this.mixinCount = connection.global_indexes.length;
    this.getConnectTransactSubscription = this.httpService.getConnectTransaction(this.connection.amount, this.i).subscribe(
      data => {
        this.ConnectTransaction = data;
      },
      err => console.error(err)
    );
  };

  // Click Mixin Count (inside pop-up)
  SetIndexItem = (index) => {
    this.currentIndex = index;
    this.getMixinCountSubscription = this.httpService.getConnectTransaction(this.connection.amount, this.currentIndex).subscribe(
      data => {
        this.ConnectTransaction = data;
        this.link = this.ConnectTransaction.tx_id;
        this.router.navigate(['/transaction', this.link], {relativeTo: this.route});
        this.showDialogMixinCount = false;
      },
      err => console.error(err),
    );
  };


  // Global Index Click
  goToTransaction(connection) {
    this.connection = connection;
    this.currentIndex = this.connection.global_indexes[0];

    this.getGlobalIndexSubscription = this.httpService.getConnectTransaction(this.connection.amount, this.currentIndex).subscribe(
      data => {
        this.ConnectTransaction = data;
        this.link = this.ConnectTransaction.tx_id;
        this.router.navigate(['/transaction', this.link], {relativeTo: this.route});
        this.showDialogMixinCount = false;
      },
      err => console.error(err),
    );
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.getTransactionSubscription) {
      this.getTransactionSubscription.unsubscribe();
    }
    if (this.getInfoSubscription) {
      this.getInfoSubscription.unsubscribe();
    }
    if (this.getConnectTransactSubscription) {
      this.getConnectTransactSubscription.unsubscribe();
    }
    if (this.getMixinCountSubscription) {
      this.getMixinCountSubscription.unsubscribe();
    }
    if (this.getGlobalIndexSubscription) {
      this.getGlobalIndexSubscription.unsubscribe();
    }
    this.navBlockchain.classList.remove('active');
    this.navBlockchainMobile.classList.remove('active');
  }

}

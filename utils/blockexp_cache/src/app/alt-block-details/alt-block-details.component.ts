import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MobileNavState} from '../http.service';

@Component({
  selector: 'app-alt-blocks-details-component',
  templateUrl: './alt-block-details.component.html',
  styleUrls: ['./alt-block-details.component.scss'],
  providers: [],
})
export class AltBlockDetailsComponent implements OnInit {
  altBlockDetails: any = {};
  info: any;
  transactList: any;
  navIsOpen: boolean;
  searchIsOpen: boolean;

  onIsVisible($event): void {
    this.searchIsOpen = $event;
  }

  constructor(
    private route: ActivatedRoute,
    private mobileNavState: MobileNavState) {
    this.navIsOpen = false;
    this.searchIsOpen = false;
  }

  ngOnInit() {
    this.info = this.route.snapshot.data['MainInfo'];
    this.altBlockDetails = this.route.snapshot.data['AltBlock'];
    this.transactList = JSON.parse(this.altBlockDetails.transactions_details);

    this.mobileNavState.change.subscribe(navIsOpen => {
      this.navIsOpen = navIsOpen;
    });
  }
}


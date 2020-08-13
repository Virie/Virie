import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, Event, NavigationEnd} from '@angular/router';
import {MobileNavState, HttpService} from './http.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [],
})
export class AppComponent implements OnInit, OnDestroy {
  navIsOpen: boolean;
  getInfoSubscription: Subscription;
  getInfoData: any;
  testNet: boolean;

  constructor(
    private httpService: HttpService,
    private router: Router,
    private mobileNavState: MobileNavState) {
    this.navIsOpen = false;
    const screenWidth = window.screen.width;
    if (screenWidth <= 761) {
      this.navIsOpen = true;
    }
    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.navIsOpen === true) {
          this.mobileNavState.toggleMenu();
        }
      }
    });
  }

  ngOnInit() {
    this.mobileNavState.change.subscribe(navIsOpen => {
      this.navIsOpen = navIsOpen;
    });
    this.getInfoSubscription = this.httpService.getInfo().subscribe(data => {
       this.getInfoData = data;
       if (this.getInfoData.test_net === 'Virie_testnet') {
         this.testNet = true;
       } else {
         this.testNet = false;
       }
    });
  }

  btnToggleMenu() {
    this.mobileNavState.toggleMenu();
  }

  ngOnDestroy() {
    if (this.getInfoSubscription) {
      this.getInfoSubscription.unsubscribe();
    }
  }


}

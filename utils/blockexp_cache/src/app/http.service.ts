import {Injectable, Output, EventEmitter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {environment} from '../environments/environment';
import {map} from 'rxjs/operators';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class HttpService {
  private serverApi = '';
  private Info = new Subject<any>();
  private infoObj: any;

  constructor(protected http: HttpClient, private router: Router) {
    if (!environment.production) {
      this.serverApi = 'http://localhost:8008';
    }
    const self = this;

    function getTimeOut() {
      setTimeout(function () {
        self.http.get(self.serverApi + '/get_info').toPromise()
          .then(response => {
            self.infoObj = response;
            self.Info.next(self.infoObj);
            if (router.url === '/server-error') {
              router.navigate(['/']);
            }
            getTimeOut();
          })
          .catch(() => {
            router.navigate(['/server-error']);
            getTimeOut();
          })
      }, 6000);
    }
    getTimeOut();
  }

  subscribeInfo() {
    return this.Info.asObservable();
  }

  getInfo(): Observable<Response> {
    if (this.infoObj === undefined) {
      const URL = `${this.serverApi}/get_info`;
      return this.http.get(URL).map(response => {
        this.infoObj = response;
        return this.infoObj;
      });
    } else {
      return this.infoObj;
    }
  }

  // Blockchain Page
  public getBlockDetails(start: number, limit: number) {
    const URL = `${this.serverApi}/get_blocks_details/${start}/${limit}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }

  public getMainBlockDetails(id: any) {
    const URL = `${this.serverApi}/get_main_block_details/${id}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }

  public getTxPoolDetails(limit: number) {
    const URL = `${this.serverApi}/get_tx_pool_details/${limit}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }


  // Alt-blocks Page
  public getAltBlocks(offset: number, count: number) {
    const URL = `${this.serverApi}/get_alt_blocks_details/${offset}/${count}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }

  public getAltDetailBlock(id: any) {
    const URL = `${this.serverApi}/get_alt_block_details/${id}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }

  // Transaction Page
  public getTransaction(tx_hash: any) {
    const URL = `${this.serverApi}/get_tx_details/${tx_hash}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }

  public getConnectTransaction(amount, i) {
    const URL = `${this.serverApi}/get_out_info/${amount}/${i}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }

  // Aliases Page
  public getAliases(offset: number, count: number, search: any) {
    if (!search) {
      search = 'all';
    }
    const URL = `${this.serverApi}/get_aliases/${offset}/${count}/${search}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }

  // Market page
  public getOffersCurrency(type: string, offset: number, count: number, sortingField: string, sortingDirect: boolean, keyword: string, ot: number, p: string, pt: any, time: string, time_start: string, time_end: string, location: string, lco: string, lci: string, ap_from: any, ap_to: any, rate_from: any, rate_to: any) {
    const URL = `${this.serverApi}/get_offers`;
    return this.http.post(URL, JSON.stringify({type: type, offset: offset, count: count, sortingField: sortingField, sortingDirect: sortingDirect, keyword: keyword, ot: ot, p: p, pt: pt, time: time, time_start: time_start, time_end: time_end, location: location, lco: lco, lci: lci, ap_from: ap_from, ap_to: ap_to, rate_from: rate_from, rate_to: rate_to})).map((response) => {
      return response;
    });
  }
  public getOffersProducts(type: string, offset: number, count: number, sortingField: string, sortingDirect: boolean, keyword: string, keyword_only_title: boolean, ot: number, cat: string, time: string, time_start: string, time_end: string, p: string, pt: any, location: string, lco: string, lci: string, ap_from: any, ap_to: any) {
    const URL = `${this.serverApi}/get_offers`;
    return this.http.post(URL, JSON.stringify({type: type, offset: offset, count: count, sortingField: sortingField, sortingDirect: sortingDirect, keyword: keyword, keyword_only_title: keyword_only_title, ot: ot, cat: cat, time: time, time_start: time_start, time_end: time_end, p: p, pt: pt, location: location, lco: lco, lci: lci, ap_from: ap_from, ap_to: ap_to})).map((response) => {
      return response;
    });
  }

  public searchById(search: any) {
    const URL = `${this.serverApi}/search_by_id/${search}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }

  public getChart(chart: string, startDate: string, endDate: string) {
    const URL = `${this.serverApi}/get_chart/${chart}/${startDate}/${endDate}`;
    return this.http.get(URL).pipe(map((response) => {
      return response;
    }));
  }
}


// MainInfo resolve
@Injectable()
export class ServiceResolver implements Resolve<any> {
  constructor(private service: HttpService) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.service.getInfo();
  }
}

// AltBlock resolve
@Injectable()
export class ResolveAltBlock implements Resolve<any> {
  constructor(private service: HttpService) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    const id: any = route.params['id'];
    return this.service.getAltDetailBlock(id);
  }
}

@Injectable()
export class MobileNavState {
  navIsOpen = true;
  @Output() change: EventEmitter<boolean> = new EventEmitter();

  toggleMenu() {
    this.navIsOpen = this.navIsOpen !== true;
    this.change.emit(this.navIsOpen);
  }
}

// Modules
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {routes} from './app.router';
import {MomentModule} from 'angular2-moment';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CookieService, CookieOptions} from 'angular2-cookie/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DropDownsModule} from '@progress/kendo-angular-dropdowns';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {TooltipModule} from '@progress/kendo-angular-tooltip';

import {ChartModule} from 'angular-highcharts';
import * as highstock from 'highcharts/modules/stock.src';
import * as Highcharts from 'highcharts';
import StockModule from 'highcharts/modules/stock';
import * as boost from 'highcharts/modules/boost'

StockModule(Highcharts);
boost(Highcharts);

// Services
import {HttpService} from './http.service';
import {ServiceResolver, ResolveAltBlock} from './http.service';
import {MobileNavState} from './http.service';


// Pipes
import {OrderPipe} from './pipes.pipe';
import {OrderByPipe} from './pipes.pipe';
import {SortGridPipe} from './pipes.pipe';
import {BitNumberPipe} from './pipes.pipe';
import {MoneyParsePipe} from './pipes.pipe';
import {TruncatePipe} from './pipes.pipe';
import {TimeAgoPipe} from './pipes.pipe';
import {CategoryPipe} from './pipes.pipe';
import {LangPipe} from './pipes.pipe';
import {SortByAlphabetPipe} from './pipes.pipe';
import {HashRateConverterPipe} from './pipes.pipe';

// Components
import {AppComponent} from './app.component';
import {MainInfoComponent} from './main-info/main-info.component';
import {BlockchainComponent} from './blockchain/blockchain.component';
import {BlockDetailsComponent} from './block-details/block-details.component';
import {AltBlocksComponent} from './alt-blocks/alt-blocks.component';
import {AltBlockDetailsComponent} from './alt-block-details/alt-block-details.component';
import {AliasesComponent} from './aliases/aliases.component';
import {MarketComponent} from './market/market.component';
import {TransactionComponent} from './transaction/transaction.component';
import {DialogComponent} from './dialog/dialog.component';
import {ServerErrorComponent} from './server-error/server-error.component';
import {SearchComponent} from './search/search.component';
import {ApiComponent} from './api/api.component';

import {ChartsComponent} from './charts/charts.component';
import {AvgBlockSizeComponent} from './charts/avg-block-size/avg-block-size.component';
import {AvgTransPerBlockComponent} from './charts/avg-trans-per-block/avg-trans-per-block.component';
import {ConfirmTransPerDayComponent} from './charts/confirm-trans-per-day/confirm-trans-per-day.component';
import {DifficultyComponent} from './charts/difficulty/difficulty.component';
import {DifficultyPowComponent} from './charts/difficulty-pow/difficulty-pow.component';
import {HashrateComponent} from './charts/hashrate/hashrate.component';
import {DensityPowComponent} from './charts/density-pow/density-pow.component';
import {DensityPosComponent} from './charts/density-pos/density-pos.component';
import {DensityBlocksComponent} from './charts/density-blocks/density-blocks.component';

import {Angular2AirDatepickerModule, AIR_LANGUAGES, AirLanguage} from 'angular2-air-datepicker';

AIR_LANGUAGES.set('en-short', new AirLanguage(
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
));

@NgModule({
  declarations: [
    // Components
    AppComponent,
    MainInfoComponent,
    BlockchainComponent,
    BlockDetailsComponent,
    AltBlocksComponent,
    AltBlockDetailsComponent,
    AliasesComponent,
    MarketComponent,
    TransactionComponent,
    DialogComponent,
    ServerErrorComponent,
    SearchComponent,
    ChartsComponent,
    AvgBlockSizeComponent,
    AvgTransPerBlockComponent,
    HashrateComponent,
    DifficultyComponent,
    DifficultyPowComponent,
    ConfirmTransPerDayComponent,
    ChartsComponent,
    AvgBlockSizeComponent,
    AvgTransPerBlockComponent,
    ConfirmTransPerDayComponent,
    DifficultyComponent,
    DifficultyPowComponent,
    HashrateComponent,
    ApiComponent,
    DensityPowComponent,
    DensityPosComponent,
    DensityBlocksComponent,

    // Pipes
    OrderPipe,
    OrderByPipe,
    SortGridPipe,
    BitNumberPipe,
    MoneyParsePipe,
    TruncatePipe,
    TimeAgoPipe,
    CategoryPipe,
    LangPipe,
    SortByAlphabetPipe,
    HashRateConverterPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routes,
    BrowserAnimationsModule,
    MomentModule,
    MatProgressSpinnerModule,
    DropDownsModule,
    Angular2AirDatepickerModule,
    ChartModule,
    NgxJsonViewerModule,
    TooltipModule
  ],
  providers: [
    HttpService,
    ServiceResolver,
    ResolveAltBlock,
    CookieService, {provide: CookieOptions, useValue: false},
    MobileNavState,
    {provide: ChartModule, useFactory: () => [highstock]}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

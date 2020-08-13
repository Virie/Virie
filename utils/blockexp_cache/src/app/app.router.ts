import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

// Components
import {BlockchainComponent} from './blockchain/blockchain.component';
import {BlockDetailsComponent} from './block-details/block-details.component';
import {AltBlocksComponent} from './alt-blocks/alt-blocks.component';
import {AltBlockDetailsComponent} from './alt-block-details/alt-block-details.component';
import {AliasesComponent} from './aliases/aliases.component';
import {MarketComponent} from './market/market.component';
import {TransactionComponent} from './transaction/transaction.component';
import {ApiComponent} from './api/api.component';

import {ChartsComponent} from './charts/charts.component';
import {AvgBlockSizeComponent} from './charts/avg-block-size/avg-block-size.component';
import {AvgTransPerBlockComponent} from './charts/avg-trans-per-block/avg-trans-per-block.component';
import {HashrateComponent} from './charts/hashrate/hashrate.component';
import {DifficultyComponent} from './charts/difficulty/difficulty.component';
import {DifficultyPowComponent} from './charts/difficulty-pow/difficulty-pow.component';
import {ConfirmTransPerDayComponent} from './charts/confirm-trans-per-day/confirm-trans-per-day.component';
import {DensityPowComponent} from './charts/density-pow/density-pow.component';
import {DensityPosComponent} from './charts/density-pos/density-pos.component';
import {DensityBlocksComponent} from './charts/density-blocks/density-blocks.component';

import {ServerErrorComponent} from './server-error/server-error.component'

// Resolve
import {ServiceResolver, ResolveAltBlock} from './http.service';

export const router: Routes = [
  {
    path: '',
    component: BlockchainComponent,
    resolve: {
      MainInfo: ServiceResolver
    }
  },
  {
    path: 'market',
    component: MarketComponent
  },
  {
    path: 'block/:id',
    component: BlockDetailsComponent,
    resolve: {
      MainInfo: ServiceResolver
    }
  },
  {
    path: 'transaction/:tx_hash',
    component: TransactionComponent,
    resolve: {
      MainInfo: ServiceResolver,
    }
  },
  {
    path: 'charts',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ChartsComponent
      },
      {
        path: 'avg-block-size',
        component: AvgBlockSizeComponent
      },
      {
        path: 'avg-trans-per-block',
        component: AvgTransPerBlockComponent
      },
      {
        path: 'hash-rate',
        component: HashrateComponent
      },
      {
        path: 'difficulty-pos',
        component: DifficultyComponent
      },
      {
        path: 'difficulty-pow',
        component: DifficultyPowComponent
      },
      {
        path: 'confirm-trans-per-day',
        component: ConfirmTransPerDayComponent
      },
      {
        path: 'density-pow',
        component: DensityPowComponent
      },
      {
        path: 'density-pos',
        component: DensityPosComponent
      },
      {
        path: 'density-blocks',
        component: DensityBlocksComponent
      },
    ]
  },
  {
    path: 'aliases',
    component: AliasesComponent,
    resolve: {
      MainInfo: ServiceResolver
    }
  },
  {
    path: 'alt-blocks',
    component: AltBlocksComponent
  },
  {
    path: 'alt-blocks/:id',
    component: AltBlockDetailsComponent,
    resolve: {
      MainInfo: ServiceResolver,
      AltBlock: ResolveAltBlock
    }
  },
  {
    path: 'api',
    component: ApiComponent
  },
  {
    path: 'server-error',
    component: ServerErrorComponent
  },
  {path: '', redirectTo: '', pathMatch: 'full'},
  {path: '**', redirectTo: '', component: BlockchainComponent}
];

export const routes: ModuleWithProviders = RouterModule.forRoot(router);
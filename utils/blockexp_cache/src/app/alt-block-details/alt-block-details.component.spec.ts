import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AltBlockDetailsComponent } from './alt-block-details.component';

import { MainInfoComponent } from './../main-info/main-info.component';
import { MomentModule } from 'angular2-moment';
import { BitNumberPipe, MoneyParsePipe } from '.././pipes.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpService } from './../http.service';
import { HttpModule } from '@angular/http';

describe('AltBlocksDetailsComponent', () => {
  let component: AltBlockDetailsComponent;
  let fixture: ComponentFixture<AltBlockDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AltBlockDetailsComponent,
        MainInfoComponent,
        BitNumberPipe,
        MoneyParsePipe
      ],
      providers: [
        HttpService,
      ],
      imports: [
        HttpModule,
        MomentModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AltBlockDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

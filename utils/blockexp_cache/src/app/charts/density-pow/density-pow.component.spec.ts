import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DensityPowComponent } from './density-pow.component';

describe('DensityPowComponent', () => {
  let component: DensityPowComponent;
  let fixture: ComponentFixture<DensityPowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DensityPowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DensityPowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

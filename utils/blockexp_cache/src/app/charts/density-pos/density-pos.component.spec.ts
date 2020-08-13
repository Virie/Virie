import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DensityPosComponent } from './density-pos.component';

describe('DensityPosComponent', () => {
  let component: DensityPosComponent;
  let fixture: ComponentFixture<DensityPosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DensityPosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DensityPosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

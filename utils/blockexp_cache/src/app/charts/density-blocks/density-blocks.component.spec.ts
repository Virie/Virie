import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DensityBlocksComponent } from './density-blocks.component';

describe('DensityBlocksComponent', () => {
  let component: DensityBlocksComponent;
  let fixture: ComponentFixture<DensityBlocksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DensityBlocksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DensityBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

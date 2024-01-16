import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEstimacionComponent } from './registro-estimacion.component';

describe('RegistroEstimacionComponent', () => {
  let component: RegistroEstimacionComponent;
  let fixture: ComponentFixture<RegistroEstimacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroEstimacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroEstimacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

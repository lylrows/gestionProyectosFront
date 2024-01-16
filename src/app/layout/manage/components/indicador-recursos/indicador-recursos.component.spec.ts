import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadorRecursosComponent } from './indicador-recursos.component';

describe('IndicadorRecursosComponent', () => {
  let component: IndicadorRecursosComponent;
  let fixture: ComponentFixture<IndicadorRecursosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicadorRecursosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadorRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

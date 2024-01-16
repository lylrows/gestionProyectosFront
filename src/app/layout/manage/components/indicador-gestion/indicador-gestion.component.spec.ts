import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadorGestionComponent } from './indicador-gestion.component';

describe('IndicadorGestionComponent', () => {
  let component: IndicadorGestionComponent;
  let fixture: ComponentFixture<IndicadorGestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicadorGestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadorGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

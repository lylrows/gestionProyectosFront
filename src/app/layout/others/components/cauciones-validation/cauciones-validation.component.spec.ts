import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaucionesValidationComponent } from './cauciones-validation.component';

describe('CaucionesValidationComponent', () => {
  let component: CaucionesValidationComponent;
  let fixture: ComponentFixture<CaucionesValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaucionesValidationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaucionesValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

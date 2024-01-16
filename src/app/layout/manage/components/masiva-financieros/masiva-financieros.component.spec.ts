import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasivaFinancierosComponent } from './masiva-financieros.component';

describe('MasivaFinancierosComponent', () => {
  let component: MasivaFinancierosComponent;
  let fixture: ComponentFixture<MasivaFinancierosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasivaFinancierosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasivaFinancierosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

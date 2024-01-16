import { TestBed } from '@angular/core/testing';

import { CaucionesvalidationService } from './caucionesvalidation.service';

describe('CaucionesvalidationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CaucionesvalidationService = TestBed.get(CaucionesvalidationService);
    expect(service).toBeTruthy();
  });
});

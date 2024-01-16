import { TestBed } from '@angular/core/testing';

import { MassiveloadService } from './massiveload.service';

describe('MassiveloadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MassiveloadService = TestBed.get(MassiveloadService);
    expect(service).toBeTruthy();
  });
});

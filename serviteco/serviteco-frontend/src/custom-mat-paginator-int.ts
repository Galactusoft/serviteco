import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  constructor() {
    super();
    // Initialize the translations once at construction time
    this.itemsPerPageLabel = 'Registros por página';
  }

  getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const of = "de";
    this.firstPageLabel = "Primera página";
    this.itemsPerPageLabel = "Registros por página";
    this.lastPageLabel = "Última página";
    this.nextPageLabel = "Siguiente";
    this.previousPageLabel = "Anterior";
    if (length === 0 || pageSize === 0) {
      return "0 " + of + " " + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize > length ? (Math.ceil(length / pageSize) - 1) * pageSize : page * pageSize;

    const endIndex = Math.min(startIndex + pageSize, length);
    return startIndex + 1 + " - " + endIndex + " " + of + " " + length;
  };

}
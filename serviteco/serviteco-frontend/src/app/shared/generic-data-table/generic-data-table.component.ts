import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldDefaultOptions,
} from '@angular/material/form-field';
import { TableColumn } from './table-column.interface';

@Component({
    selector: 'generic-data-table',
    templateUrl: './generic-data-table.component.html',
    styleUrls: ['./generic-data-table.component.scss'],
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'standard',
            } as MatFormFieldDefaultOptions,
        },
    ],
})
export class GenericDataTableComponent<T> implements OnInit, OnChanges, AfterViewInit {
    @Input() data: T[];
    @Input() columns: TableColumn<T>[];
    @Input() pageSize = 10;
    @Input() pageSizeOptions = [10, 20, 50];
    @Input() searchStr: string;
    @Input() showPaginator = true;
    @Input() cantidad: number;
    pageSizeInit = 10;

    @Output() toggleStar = new EventEmitter<T>();
    @Output() deleteRow = new EventEmitter<T>();
    @Output() openRow = new EventEmitter<T>();
    @Output() checkRow = new EventEmitter<{ data: T; event: any }>();
    @Output() slideRow = new EventEmitter<{ data: T; event: any }>();
    @Output() slideRow2 = new EventEmitter<{ data: T; event: any }>();
    @Output() paginacion = new EventEmitter<T>();

    visibleColumns: Array<keyof T | string>;
    dataSource = new MatTableDataSource<T>();
    selected: T;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;


    constructor() { }

    ngOnInit() {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.columns) {
            this.visibleColumns = this.columns.map((column) => column.property);
        }

        if (changes.data) {
            this.dataSource.data = this.data;
        }

        if (changes.searchStr) {
            this.dataSource.filter = (this.searchStr || '').trim().toLowerCase();
        }
    }

    emitToggleStar(event: Event, row: T) {
        event.stopPropagation();
        this.toggleStar.emit(row);
    }

    emitDelete(event: Event, row: T) {
        event.stopPropagation();
        this.deleteRow.emit(row);
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    emitSelect(event: Event, row: T) {
        event.stopPropagation();
        this.selected = row;
        this.openRow.emit(row);
    }

    getIcon(nombre: string) {
        return "save";
    }

    mostrarMas(e: any) {
        this.paginacion.emit(e);
    }
}

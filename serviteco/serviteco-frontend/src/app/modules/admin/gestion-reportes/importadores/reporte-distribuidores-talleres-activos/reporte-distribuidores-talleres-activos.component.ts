import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, filter, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BuscadorImportadorasComponent } from '../../../buscadores/buscador-importador/buscador-importador.component';
import { Importador } from '../../../gestion-importadores/importadores';
import { GestionReporteImportadorService } from '../../gestion-reportes-importador.service';
import Swal from 'sweetalert2';
import { GestionReportesService } from 'app/shared/gestion-reportes.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { Paginator } from '../../../paginator';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
    selector: 'reporte-distribuidores-talleres-activos',
    templateUrl: './reporte-distribuidores-talleres-activos.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteDistribuidoresTalleresActivosComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Paginator
    dataPaginator$: Observable<any>;
    dataCount: number = 0;
    dataCountTalleres: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    data: any;
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    dataSourceTalleres: MatTableDataSource<any> = new MatTableDataSource();
    tableColumns: string[] = ['id', 'nombre', 'direccion', 'telefono', 'correo', 'correo_contabilidad', 'estado', 'fecha_sistema'];
    tableColumnsTalleres: string[] = ['id', 'nit', 'nombre', 'direccion', 'telefono', 'correo', 'correo_contabilidad', 'estado', 'fecha_sistema'];
    orderBy: string = "1";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;
    cantidad: number;

    valorTotalRepuestos: number = 0;
    valorTotalManoObra: number = 0;
    valorTotal: number = 0;

    searchStrAbiertas$ = new BehaviorSubject<string>('');
    loadData: boolean = false;
    puedeSeleccionarImportador: boolean = false;

    form = this._formBuilder.group({
        fecha_inicial: null,
        fecha_final: null,
        id_importador: null,
        nombre_importador: null,
        id_marca: null,
        nombre_marca: null,
        id_distribuidor: null,
        proceso: 'all',
    });

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _gestionReporteService: GestionReporteImportadorService,
        private _gestionReportesService: GestionReportesService,
        private _aut: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngAfterViewInit(): void {
        // Make the data source sortable
        this.dataSource.sort = this.sort;
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the contactenoss
        if (this._aut.accessAdmin == 'administrador') {
            this.puedeSeleccionarImportador = true;
        } else if (this._aut.accessAdmin == 'importador') {
            this.puedeSeleccionarImportador = false;
            this.form.get('id_importador').setValue(this._aut.accessImportador);
            this.form.get('nombre_importador').setValue(this._aut.accessCompany);
        } else if (this._aut.accessAdmin == 'distribuidor') {
            this.puedeSeleccionarImportador = true;
        }

        this.dataPaginator$ = this._gestionReporteService.dataPaginator$;
        this.dataSource.sort = this.sort;

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * Open categorias dialog
    */
    openBuscadorImportador(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorImportadorasComponent, {
            data: {
                idTaller: localStorage.getItem('accessTaller')
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Importador = result[1];
                this.form.get('id_importador').setValue(selected.id);
                this.form.get('nombre_importador').setValue(selected.nombre);
                this.form.get('id_marca').setValue('');
                this.form.get('nombre_marca').setValue('');
            });
    }

    consultarData() {
        const busqueda = this.form.getRawValue();
        const paginator = new Paginator();
        paginator.pageIndex = this.pageIndex;
        paginator.pageSize = this.pageSize;
        paginator.filter = this.filter || 'all';
        paginator.order = this.order;
        paginator.orderBy = this.orderBy;
        paginator.id_importador = busqueda.id_importador;
        paginator.fecha_inicial = busqueda.fecha_inicial;
        paginator.fecha_final = busqueda.fecha_final;
        // Search
        this._gestionReporteService.getDistribuidoresTalleresActivosImportadorPaginator(paginator).subscribe(data => {

            // Update the counts
            this.dataCount = data.cantidad[0]['total'];

            // Store the table data
            this.dataSource.data = data.registros;

            // Update the counts talleres
            this.dataCountTalleres = data.talleresCount[0]['total'];

            // Store the table data talleres
            this.dataSourceTalleres.data = data.talleres;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this.dataSource.sort = this.sort;

    }

    sortData(sort: Sort) {
        this.order = sort.direction;
        this.orderBy = sort.active;
        this.consultarData();
    }

    mostrarMas(e: any) {
        this.pageIndex = e.pageIndex * 10;
        this.pageSize = e.pageSize;
        this.consultarData();
    }

    applyFilter(filterValue: string): void {
        this.filter = (filterValue || 'all').trim().toLowerCase();
        //this.paginator.firstPage();
        this.consultarData();
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create contactenos
     */
    exportar(): void {
        const busqueda = this.form.getRawValue();
        if (this._aut.accessAdmin == 'distribuidor') {
            busqueda.id_importador = this._aut.accessImportador;
        }
        this._gestionReporteService.getExportDistribuidoresTalleresActivosImportadorPaginator(busqueda).subscribe(data => {
            if (this.dataCount > 0 || this.dataCountTalleres > 0 ) {
                var head = ['Id', 'Nombre', 'Dirección', 'Teléfono', 'Correo', 'Correo contabilidad', 'Estado', 'Fecha Sistema'];
                var headTaller = ['Id', 'NIT', 'Nombre', 'Dirección', 'Teléfono', 'Correo', 'Correo contabilidad', 'Estado', 'Fecha Sistema'];
                this.exportReportAsExcelFile(data.registros, 'reporte_distribuidores_talleres_activos', head, data.talleres, headTaller);
            } else {
                Swal.fire({
                    title: 'No existe información para exportar reporte con los parámetros de búsqueda ingresados',
                    icon: 'error',
                    timer: 2500
                })
            }
        })
    }

    // FUNCION QUE PERMITE EXPORTAR DOCUMENTO EN EXCEL
    exportReportAsExcelFile(obj: any[], excelFileName: string, customHead: string[], objTaller: any[], customHeadTaller: string[]): void {

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(obj);

        if (customHead.length > 0) {
            var heading = [customHead]
            XLSX.utils.sheet_add_aoa(worksheet, heading);
            var range = XLSX.utils.decode_range(worksheet['!ref'] || '');
            for (var C = range.s.r; C <= range.e.c; ++C) {
                var address = XLSX.utils.encode_col(C) + '1';
                if (!worksheet[address]) continue;
                worksheet[address].v = worksheet[address].v
            }
        }

        const worksheetTaller: XLSX.WorkSheet = XLSX.utils.json_to_sheet(objTaller);

        if (customHeadTaller.length > 0) {
            var headingTaller = [customHeadTaller]
            XLSX.utils.sheet_add_aoa(worksheetTaller, headingTaller);
            var range = XLSX.utils.decode_range(worksheetTaller['!ref'] || '');
            for (var C = range.s.r; C <= range.e.c; ++C) {
                var addressTaller = XLSX.utils.encode_col(C) + '1';
                if (!worksheetTaller[addressTaller]) continue;
                worksheetTaller[addressTaller].v = worksheetTaller[addressTaller].v
            }
        }

        const workbook: XLSX.WorkBook = { Sheets: { 'distribuidores': worksheet, 'talleres': worksheetTaller }, SheetNames: ['distribuidores', 'talleres'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this._saveAsExcelFile(excelBuffer, excelFileName);

    }

    private _saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + '_' + new Date().getTime() + EXCEL_EXTENSION);
    }


    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    abrirDetalleFactura() {

    }

}

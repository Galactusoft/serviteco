import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { GestionReporteService } from '../../gestion-reportes.service';
import { AuthService } from 'app/core/auth/auth.service';
import { ApexOptions } from 'ng-apexcharts';
@Component({
    selector: 'reporte-grafico-importador',
    templateUrl: './reporte-grafico-importador.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteGraficoImportadorComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    chartGithubIssues: ApexOptions = {};
    chartGarantias: Partial<ApexOptions>;
    chartManoObraTaller: Partial<ApexOptions>;
    data: any;
    public chartOptions: Partial<ApexOptions>;
    promedioRespuesta: number = 0;
    promedioReparacion: number = 0;
    referenciaMasVendida: string = "";
    referenciaMenosVendida: string = "";
    loadGraficoReferencias: boolean = false;
    loadGraficoGarantias: boolean = false;
    loadGraficoCostos: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _gestionReporteService: GestionReporteService,
        private _aut: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngAfterViewInit(): void {
        // Make the data source sortable
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the contactenoss
        if (this._aut.accessAdmin == 'administrador') {

        } else if (this._aut.accessAdmin == 'importador') {

        } else if (this._aut.accessAdmin == 'distribuidor') {

        }

        // Get the data
        this._gestionReporteService.getDataReporteGraficoReferenciasVendidas(this._aut.accessImportador)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                const dataLabel: string[] = [];
                const dataLabel2: string[] = [];
                const dataSeries: number[] = [];

                data.registros.forEach(element => {
                    dataLabel.push(element["distribuidora"] + " <br> " + element["nombre"]);
                    dataLabel2.push(element["nombre"]);
                    const valor = Number(element["total"])
                    dataSeries.push(valor);
                });

                // Prepare the chart data
                this.chartOptions = {
                    series: [
                        {
                            name: "Productos vendidos",
                            data: dataSeries,
                        },
                    ],
                    chart: {
                        fontFamily: 'inherit',
                        foreColor: 'inherit',
                        height: '100%',
                        type: 'bar',
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            enabled: false
                        }
                    },
                    colors: ['#64748B', '#94A3B8'],
                    plotOptions: {
                        bar: {
                            columnWidth: '50%',
                            horizontal: false,
                        }
                    },
                    legend: {
                        show: false
                    },
                    dataLabels: {
                        enabled: true
                    },
                    xaxis: {
                        tickAmount: 3,
                        labels: {
                            hideOverlappingLabels: true,
                            show: true,
                            trim: true,
                            rotate: 0,
                            style: {
                                fontSize: "8"
                            },
                        },

                        categories: dataLabel
                    }
                };

                this.loadGraficoReferencias = true;


                // Mark for check
                this._changeDetectorRef.markForCheck();

            });

        this._gestionReporteService.getDataReporteGraficoGarantiasSolicitadasImportador(this._aut.accessImportador)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                const dataLabel: string[] = [];
                const dataSeries: number[] = [];

                data.registros.forEach(element => {
                    dataLabel.push(element["distribuidora"]);
                    const valor = Number(element["garantias"])
                    dataSeries.push(valor);
                });

                this.chartGarantias = {
                    series: [
                        {
                            name: "Garantías reportadas",
                            data: dataSeries,
                        },
                    ],
                    chart: {
                        fontFamily: 'inherit',
                        foreColor: 'inherit',
                        height: '100%',
                        type: 'bar',
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            enabled: false
                        }
                    },
                    colors: ['#64748B', '#94A3B8'],
                    plotOptions: {
                        bar: {
                            columnWidth: '50%',
                            horizontal: false,
                        }
                    },
                    legend: {
                        show: false
                    },
                    dataLabels: {
                        enabled: true
                    },
                    xaxis: {
                        tickAmount: 3,
                        labels: {
                            hideOverlappingLabels: true,
                            show: true,
                            trim: true,
                            rotate: 0,
                            style: {
                                fontSize: "8"
                            }
                        },

                        categories: dataLabel
                    },
                };

                this.loadGraficoGarantias = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Prepare the chart data

            });

        this._gestionReporteService.getDataReporteGraficoInfoGeneralImportador(this._aut.accessImportador)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                this.promedioRespuesta = data.registros[0].promedio_evaluacion;
                this.referenciaMasVendida = data.registros[0].nombre;

                this.promedioReparacion = data.registros[1].promedio_evaluacion;
                this.referenciaMenosVendida = data.registros[1].nombre;

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Prepare the chart data

            });

            this._gestionReporteService.getDataReporteGraficoCostosManoObraTallerImportador(this._aut.accessImportador)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                const dataLabel: string[] = [];
                const dataSeries: number[] = [];

                data.registros.forEach(element => {
                    dataLabel.push(element["taller"]);
                    const valor = Number(element["mano_obra"])
                    const format = this.numberWithCommas(valor);
                    dataSeries.push(valor);
                });

                this.chartManoObraTaller = {
                    series: [
                        {
                            name: "Costos mano de obra",
                            data: dataSeries,
                        },
                    ],
                    chart: {
                        fontFamily: 'inherit',
                        foreColor: 'inherit',
                        height: '100%',
                        type: 'bar',
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            enabled: false
                        }
                    },
                    colors: ['#64748B', '#94A3B8'],
                    plotOptions: {
                        bar: {
                            columnWidth: '50%',
                            horizontal: false,
                        }
                    },
                    legend: {
                        show: false
                    },
                    dataLabels: {
                        enabled: true
                    },
                    xaxis: {
                        tickAmount: 3,
                        labels: {
                            hideOverlappingLabels: true,
                            show: true,
                            trim: true,
                            rotate: 0,
                            style: {
                                fontSize: "8"
                            }
                        },

                        categories: dataLabel
                    },
                    yaxis: {
                        labels:{
                            formatter: (value) => {
                              return `$ ${this.numberWithCommas(value)}`;
                            },
                          },
                    }
                };

                this.loadGraficoCostos = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Prepare the chart data

            });

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    }
                }
            }
        };


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

    numberWithCommas(x) {
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
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

    /**
    * Fix the SVG fill references. This fix must be applied to all ApexCharts
    * charts in order to fix 'black color on gradient fills on certain browsers'
    * issue caused by the '<base>' tag.
    *
    * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
    *
    * @param element
    * @private
    */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

}

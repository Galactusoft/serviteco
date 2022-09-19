import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApexOptions } from 'ng-apexcharts';
import { ProjectService } from 'app/modules/admin/administrador/project.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { Estadisticas } from './estadisticas';
import { FormBuilder, FormGroup } from '@angular/forms';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { HttpClient } from '@angular/common/http';
import { GestionDistribuidoresService } from '../gestion-distribuidores/gestion-distribuidores.service';
import { Distribuidor } from '../gestion-distribuidores/distribuidores';
import { GestionProductosService } from '../gestion-productos/gestion-productos.service';
import { Paginator } from '../paginator';
import { BuscadorAvanzadoProductosComponent } from '../buscadores/buscador-avanzado-productos/buscador-avanzado-productos.component';
import { MatDialog } from '@angular/material/dialog';
import { GestionTalleresService } from '../gestion-talleres/gestion-talleres.service';
import { Producto, ProductoUbicacion } from '../gestion-productos/productos';
import { OrgChart } from 'd3-org-chart';
import { Organigrama } from './organigrama';
import { GestionImportadoresService } from '../gestion-importadores/gestion-importadores.service';
import { environment } from 'environments/environment';
import { GestionEmpresasService } from '../gestion-empresas/gestion-empresas.service';

@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [
        `
        .map-container {
            flex-grow: 1;
            width: 100%;
            height: 100vh;
        }
        `
    ],
})
export class ProjectComponent implements OnInit, OnDestroy {
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;
    estadisticas: Estadisticas;
    administracionForm: FormGroup;
    panelAdministrador: boolean = false;
    panelImportador: boolean = false;
    panelDistribuidor: boolean = false;
    panelFuncionario: boolean = false;
    panelTallerAutorizado: boolean = false;

    // initial center position for the map
    lat: number = 2.1534379;
    lng: number = -76.52959871;
    zoom: number = 6.0;
    listaDistribuidores: Distribuidor[] = [];
    listaTalleresAutorizados: Distribuidor[] = [];
    listaProductos: ProductoUbicacion[] = [];
    tipoBusqueda: boolean = true;
    iconDistribuidor = "http://maps.google.com/mapfiles/kml/pal5/icon12.png";
    iconTaller = "http://maps.google.com/mapfiles/ms/icons/mechanic.png";
    iconProductos = "http://maps.google.com/mapfiles/kml/pal4/icon3.png";
    viewProductos: boolean = true;
    viewDistribuidores: boolean = true;
    viewTalleres: boolean = true;
    countProductos: number = 0;
    countDistribuidores: number = 0;
    countTalleres: number = 0;

    orderBy: string = "id";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;

    @ViewChild("chartContainer") chartContainer: ElementRef;
    @ViewChild("chartContainerTalleres") chartContainerTalleres: ElementRef;
    @ViewChild("chartContainerDistribuidores") chartContainerDistribuidores: ElementRef;
    listadoOrganigrama: Organigrama[] = [];
    listadoOrganigramaDistribuidores: Organigrama[] = [];
    chart = new OrgChart();
    chartDistribuidores = new OrgChart();

    styles: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }]
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }]
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }]
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }]
        },
        {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }]
        }
    ];

    geoJsonObject: any;
    imagenBase64Empresa = "";

    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        private _router: Router,
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private httpClient: HttpClient,
        private _gestionDistribuidoresService: GestionDistribuidoresService,
        private _gestionProductosService: GestionProductosService,
        private _gestionTalleresService: GestionTalleresService,
        private _gestionImportadoresService: GestionImportadoresService,
        private _matDialog: MatDialog,
        private _gestionEmpresasService: GestionEmpresasService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the solicitud form
        this.administracionForm = this._formBuilder.group({
            id: [''],
            serial: [''],
            identificacion: [''],
            nombre: [''],
        });

        this.httpClient.get("https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/3aadedf47badbdac823b00dbe259f6bc6d9e1899/colombia.geo.json").subscribe(data => {
            this.geoJsonObject = data;
            this._changeDetectorRef.markForCheck();
        })
        let url: string = this._router['location']._platformLocation.location.origin;
        let urlHttps: string = url.replace("https://", "");
        let urlFinal: string = urlHttps.replace(".serviteco.com.co", "");
        this._gestionEmpresasService.getDatosEmpresa(urlFinal).subscribe(img => {
            if (img.imagen == '') {
                this.imagenBase64Empresa = "";
            } else {
                this.imagenBase64Empresa = "data:image/png;base64," + img.imagen;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        this.estadisticas = new Estadisticas();
        this.estadisticas.usuarios = '0';
        this.estadisticas.productos = '0';
        this.estadisticas.importadoras = '0';
        this.estadisticas.distribuidoras = '0';
        this.estadisticas.solicitudes = '0';
        this.estadisticas.talleres = '0';
        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                if (this.user.admin == 'administrador') {
                    this.panelAdministrador = true;
                    this.panelImportador = false;
                    this.panelDistribuidor = false;
                    // Get Estadisticas administrador
                    this._projectService.getEstadisticas('administrador').subscribe(data => {
                        this.estadisticas = data;
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionDistribuidoresService.getDistribuidores().subscribe(data => {
                        this.listaDistribuidores = data;
                        this.countDistribuidores = data.length;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionTalleresService.getTalleres().subscribe(data => {
                        this.listaTalleresAutorizados = data;
                        this.countTalleres = data.length;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionProductosService.getUbicacionProductos().subscribe(data => {
                        this.countProductos = data.length;
                        this.listaProductos = [];
                        data.forEach(item => {
                            let ubicacionProducto = new ProductoUbicacion;
                            ubicacionProducto = item;

                            ubicacionProducto.latitud = item.latitud;
                            ubicacionProducto.longitud = item.longitud;
                            this.listaProductos.push(ubicacionProducto)
                            this._changeDetectorRef.markForCheck();

                        })
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })

                    this._gestionImportadoresService.getImportadoresLogo().subscribe(listadoImportadores => {
                        const organigrama = new Organigrama();
                        organigrama.positionName = "Servicios Técnicos Agroforestales";
                        organigrama.id = "0001";
                        organigrama.parentId = "";
                        organigrama.tags = "OLTIN-DIREKTOR";
                        organigrama.name = "SERVITECO";
                        organigrama.area = "OLTIN-DIREKTOR";
                        organigrama.imageUrl =
                            "/assets/images/serviteco/Simbolo_Serviteco.png";
                        organigrama.isLoggedUser = true
                        organigrama.color = "red";
                        this.listadoOrganigrama.push(organigrama)
                        listadoImportadores.forEach(importador => {
                            const organigrama = new Organigrama();
                            organigrama.positionName = "Importadora";
                            organigrama.id = "importador" + importador.id;
                            organigrama.parentId = "0001";
                            organigrama.tags = importador.nombre;
                            organigrama.name = importador.nombre;
                            organigrama.area = importador.nombre;
                            organigrama.imageUrl = "data:image/png;base64," + importador.imagen;
                            organigrama.isLoggedUser = true
                            organigrama.color = "#bbf7d0";
                            this.listadoOrganigrama.push(organigrama)
                        })
                        this._gestionDistribuidoresService.getDistribuidoresConImportador().subscribe(listadoDistribuidoras => {
                            listadoDistribuidoras.forEach(distribuidor => {
                                const organigrama = new Organigrama();
                                organigrama.positionName = "Distribuidora";
                                organigrama.id = "distribuidor" + distribuidor.id + "importador" + distribuidor.id_importador;
                                organigrama.parentId = "importador" + distribuidor.id_importador;
                                organigrama.tags = distribuidor.nombre;
                                organigrama.name = distribuidor.nombre;
                                organigrama.area = distribuidor.nombre;
                                organigrama.imageUrl = "data:image/png;base64," + distribuidor.imagen;
                                organigrama.isLoggedUser = true
                                organigrama.color = "#bfdbfe";
                                this.listadoOrganigrama.push(organigrama)
                                this.loadOrganigrama();
                            })
                        })


                    })

                } else if (this.user.admin == 'importador') {
                    this.panelAdministrador = false;
                    this.panelImportador = true;
                    this.panelDistribuidor = false;
                    // Get Estadisticas importador
                    this._projectService.getEstadisticas('importador', this.user.importador).subscribe(data => {
                        this.estadisticas = data;
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionDistribuidoresService.getDistribuidoresPorImportador(this.user.importador).subscribe(data => {
                        this.listaDistribuidores = data;
                        this.countDistribuidores = data.length;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionTalleresService.getTalleresImportadorAutorizado(this.user.importador).subscribe(data => {
                        this.listaTalleresAutorizados = data;
                        this.countTalleres = data.length;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionProductosService.getUbicacionProductosPorImportador(this.user.importador).subscribe(data => {
                        this.countProductos = data.length;
                        this.listaProductos = [];
                        data.forEach(item => {
                            let ubicacionProducto = new ProductoUbicacion;
                            ubicacionProducto = item;

                            ubicacionProducto.latitud = item.latitud;
                            ubicacionProducto.longitud = item.longitud;
                            this.listaProductos.push(ubicacionProducto)
                            this._changeDetectorRef.markForCheck();

                        })
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionImportadoresService.getFile(this.user.importador).subscribe(img => {
                        this._gestionTalleresService.getTalleresConImportador(this.user.importador).subscribe(listadoTalleres => {
                            const organigrama = new Organigrama();
                            organigrama.positionName = "Importadora";
                            organigrama.id = "importador" + this.user.importador;
                            organigrama.parentId = "";
                            organigrama.tags = this.user.company;
                            organigrama.name = this.user.company;
                            organigrama.area = this.user.company;
                            if (img == '') {
                                organigrama.imageUrl = "";
                            } else {
                                organigrama.imageUrl = "data:image/png;base64," + img;
                            }
                            organigrama.isLoggedUser = true
                            organigrama.color = "#bfdbfe";
                            this.listadoOrganigrama.push(organigrama)
                            listadoTalleres.forEach(taller => {
                                const organigrama = new Organigrama();
                                organigrama.positionName = "Taller Autorizado";
                                organigrama.id = "taller" + taller.id;
                                organigrama.parentId = "importador" + this.user.importador;
                                organigrama.tags = taller.nombre;
                                organigrama.name = taller.nombre;
                                organigrama.area = taller.nombre;
                                organigrama.imageUrl = "data:image/png;base64," + taller.imagen;
                                organigrama.isLoggedUser = true
                                organigrama.color = "#fef08a";
                                this.listadoOrganigrama.push(organigrama)
                            })
                            this.loadOrganigramaTalleres();
                        })
                        this._gestionImportadoresService.getDistribuidoresPorImportador(this.user.importador).subscribe(listadoDistribuidores => {
                            const organigrama = new Organigrama();
                            organigrama.positionName = "Importadora";
                            organigrama.id = "importador" + this.user.importador;
                            organigrama.parentId = "";
                            organigrama.tags = this.user.company;
                            organigrama.name = this.user.company;
                            organigrama.area = this.user.company;
                            if (img == '') {
                                organigrama.imageUrl = "";
                            } else {
                                organigrama.imageUrl = "data:image/png;base64," + img;
                            }
                            organigrama.isLoggedUser = true
                            organigrama.color = "#bfdbfe";
                            this.listadoOrganigramaDistribuidores.push(organigrama)
                            listadoDistribuidores.forEach(importador => {
                                const organigrama = new Organigrama();
                                organigrama.positionName = "Distribuidor";
                                organigrama.id = "idDistribuidor" + importador.id;
                                organigrama.parentId = "importador" + this.user.importador;
                                organigrama.tags = importador.nombre;
                                organigrama.name = importador.nombre;
                                organigrama.area = importador.nombre;
                                organigrama.imageUrl = "data:image/png;base64," + importador.imagen;
                                organigrama.isLoggedUser = true
                                organigrama.color = "#fef08a";
                                this.listadoOrganigramaDistribuidores.push(organigrama)
                            })
                            this.loadOrganigramaDistribuidores();
                        })
                    })
                } else if (this.user.admin == 'distribuidor') {
                    this.panelAdministrador = false;
                    this.panelImportador = false;
                    this.panelDistribuidor = true;
                    // Get Estadisticas distribuidor
                    this._projectService.getEstadisticas('distribuidor', this.user.distribuidor).subscribe(data => {
                        this.estadisticas = data;
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionTalleresService.getTalleresAutorizadosDistribuidor(this.user.distribuidor).subscribe(data => {
                        this.listaTalleresAutorizados = data;
                        this.countTalleres = data.length;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionProductosService.getUbicacionProductosPorDistribuidor(this.user.distribuidor).subscribe(data => {
                        this.countProductos = data.length;
                        this.listaProductos = [];
                        data.forEach(item => {
                            let ubicacionProducto = new ProductoUbicacion;
                            ubicacionProducto = item;
                            ubicacionProducto.latitud = item.latitud;
                            ubicacionProducto.longitud = item.longitud;
                            this.listaProductos.push(ubicacionProducto)
                            this._changeDetectorRef.markForCheck();
                        })
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    this._gestionDistribuidoresService.getFile(this.user.distribuidor).subscribe(img => {
                        this._gestionTalleresService.getTalleresConDistribuidor(this.user.distribuidor).subscribe(listadoTalleres => {
                            const organigrama = new Organigrama();
                            organigrama.positionName = "Distribuidora";
                            organigrama.id = "distribuidor" + this.user.distribuidor;
                            organigrama.parentId = "";
                            organigrama.tags = this.user.company;
                            organigrama.name = this.user.company;
                            organigrama.area = this.user.company;
                            if (img == '') {
                                organigrama.imageUrl = "";
                            } else {
                                organigrama.imageUrl = "data:image/png;base64," + img;
                            }
                            organigrama.isLoggedUser = true
                            organigrama.color = "#bfdbfe";
                            this.listadoOrganigrama.push(organigrama)
                            listadoTalleres.forEach(taller => {
                                const organigrama = new Organigrama();
                                organigrama.positionName = "Taller Autorizado";
                                organigrama.id = "taller" + taller.id;
                                organigrama.parentId = "distribuidor" + this.user.distribuidor;
                                organigrama.tags = taller.nombre;
                                organigrama.name = taller.nombre;
                                organigrama.area = taller.nombre;
                                organigrama.imageUrl = "data:image/png;base64," + taller.imagen;
                                organigrama.isLoggedUser = true
                                organigrama.color = "#fef08a";
                                this.listadoOrganigrama.push(organigrama)
                            })
                            this.loadOrganigramaTalleres();
                        })
                        this._gestionImportadoresService.getImportadoresPorDistribuidor(this.user.distribuidor).subscribe(listadoImportadores => {
                            const organigrama = new Organigrama();
                            organigrama.positionName = "Distribuidora";
                            organigrama.id = "distribuidor" + this.user.distribuidor;
                            organigrama.parentId = "";
                            organigrama.tags = this.user.company;
                            organigrama.name = this.user.company;
                            organigrama.area = this.user.company;
                            if (img == '') {
                                organigrama.imageUrl = "";
                            } else {
                                organigrama.imageUrl = "data:image/png;base64," + img;
                            }
                            organigrama.isLoggedUser = true
                            organigrama.color = "#bfdbfe";
                            this.listadoOrganigramaDistribuidores.push(organigrama)
                            listadoImportadores.forEach(importador => {
                                const organigrama = new Organigrama();
                                organigrama.positionName = "Importadora";
                                organigrama.id = "importador" + importador.id;
                                organigrama.parentId = "distribuidor" + this.user.distribuidor;
                                organigrama.tags = importador.nombre;
                                organigrama.name = importador.nombre;
                                organigrama.area = importador.nombre;
                                organigrama.imageUrl = "data:image/png;base64," + importador.imagen;
                                organigrama.isLoggedUser = true
                                organigrama.color = "#fef08a";
                                this.listadoOrganigramaDistribuidores.push(organigrama)
                            })
                            this.loadOrganigramaDistribuidores();
                        })
                    });
                } else if (this.user.admin == 'funcionario' && this.user.jefe == 'SI') {
                    this.panelAdministrador = false;
                    this.panelImportador = false;
                    this.panelDistribuidor = false;
                    this.panelFuncionario = true;
                    // Get Estadisticas distribuidor
                    this._projectService.getEstadisticas('funcionario', this.user.taller).subscribe(data => {
                        this.estadisticas = data;
                        this._changeDetectorRef.markForCheck();
                    })
                } else if (this.user.admin == 'taller autorizado') {
                    this.panelAdministrador = false;
                    this.panelImportador = false;
                    this.panelDistribuidor = false;
                    this.panelFuncionario = false;
                    this.panelTallerAutorizado = true;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the data
        this._projectService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
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

        const source = new VectorSource({
            url: 'https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/3aadedf47badbdac823b00dbe259f6bc6d9e1899/colombia.geo.json',
            format: new GeoJSON(),
        });

    }

    loadOrganigrama() {
        this.chart
            .container(this.chartContainer.nativeElement)
            .svgHeight(window.innerHeight - 400)
            .data(this.listadoOrganigrama)
            .nodeWidth((d) => 250)
            .initialZoom(1)
            .nodeHeight((d) => 175)
            .childrenMargin((d) => 40)
            .compactMarginBetween((d) => 15)
            .compactMarginPair((d) => 80)
            .neightbourMargin((a, b) => 50)
            .siblingsMargin((d) => 100)
            .layout("left").render().fit()
            .buttonContent(({ node, state }) => {
                return `<div style="color:#2CAAE5;border-radius:5px;padding:3px;font-size:10px;margin:auto auto;background-color:#040910;border: 1px solid #2CAAE5"> <span style="font-size:9px">${node.children
                    ? `<i class="fas fa-angle-up"></i>`
                    : `<i class="fas fa-angle-down"></i>`
                    }</span> ${node.data._directSubordinates}  </div>`;
            })
            .onNodeClick(d => this.redireccionarOrganigrama(d))
            .nodeContent(function (d, i, arr, state) {
                return `
            <div style="padding-top:30px;background-color:none;margin-left:1px;height:${d.height
                    }px;border-radius:2px;overflow:visible">
              <div style="height:${d.height - 32
                    }px;padding-top:0px;background-color:white;border:1px solid lightgray;">

                <img src="${d.data.imageUrl
                    }" style="margin-top:-30px;margin-left:${d.width / 2 - 30}px;border-radius:100px;width:60px;height:60px;" />


               <div style="margin-top:-30px;background-color:${d.data.color};height:10px;width:${d.width - 2
                    }px;border-radius:1px"></div>

               <div style="padding:20px; padding-top:35px;text-align:center">
               <div style="color:#404040;font-size:16px;margin-top:4px"> ${d.data.positionName
                    } </div>
                   <div style="color:#111672;font-size:16px;font-weight:bold"> ${d.data.name
                    } </div>
               </div>
              </div>
      </div>
  `;
            })
            .render();
        this._changeDetectorRef.markForCheck();
    }

    loadOrganigramaTalleres() {
        this.chart
            .container(this.chartContainerTalleres.nativeElement)
            .svgHeight(window.innerHeight - 400)
            .data(this.listadoOrganigrama)
            .nodeWidth((d) => 250)
            .initialZoom(1)
            .nodeHeight((d) => 175)
            .childrenMargin((d) => 40)
            .compactMarginBetween((d) => 15)
            .compactMarginPair((d) => 80)
            .neightbourMargin((a, b) => 50)
            .siblingsMargin((d) => 100)
            .layout("left").render().fit()
            .buttonContent(({ node, state }) => {
                return `<div style="color:#2CAAE5;border-radius:5px;padding:3px;font-size:10px;margin:auto auto;background-color:#040910;border: 1px solid #2CAAE5"> <span style="font-size:9px">${node.children
                    ? `<i class="fas fa-angle-up"></i>`
                    : `<i class="fas fa-angle-down"></i>`
                    }</span> ${node.data._directSubordinates}  </div>`;
            })
            .onNodeClick(d => this.redireccionarOrganigrama(d))
            .nodeContent(function (d, i, arr, state) {
                return `
            <div style="padding-top:30px;background-color:none;margin-left:1px;height:${d.height
                    }px;border-radius:2px;overflow:visible">
              <div style="height:${d.height - 32
                    }px;padding-top:0px;background-color:white;border:1px solid lightgray;">

                <img src="${d.data.imageUrl
                    }" style="margin-top:-30px;margin-left:${d.width / 2 - 30}px;border-radius:100px;width:60px;height:60px;" />


               <div style="margin-top:-30px;background-color:${d.data.color};height:10px;width:${d.width - 2
                    }px;border-radius:1px"></div>

               <div style="padding:20px; padding-top:35px;text-align:center">
               <div style="color:#404040;font-size:16px;margin-top:4px"> ${d.data.positionName
                    } </div>
                   <div style="color:#111672;font-size:16px;font-weight:bold"> ${d.data.name
                    } </div>
               </div>
              </div>
      </div>
  `;
            })
            .render();
        this._changeDetectorRef.markForCheck();
    }

    loadOrganigramaDistribuidores() {
        this.chartDistribuidores
            .container(this.chartContainerDistribuidores.nativeElement)
            .svgHeight(window.innerHeight - 400)
            .data(this.listadoOrganigramaDistribuidores)
            .nodeWidth((d) => 250)
            .initialZoom(1)
            .nodeHeight((d) => 175)
            .childrenMargin((d) => 40)
            .compactMarginBetween((d) => 15)
            .compactMarginPair((d) => 80)
            .neightbourMargin((a, b) => 50)
            .siblingsMargin((d) => 100)
            .layout("left").render().fit()
            .buttonContent(({ node, state }) => {
                return `<div style="color:#2CAAE5;border-radius:5px;padding:3px;font-size:10px;margin:auto auto;background-color:#040910;border: 1px solid #2CAAE5"> <span style="font-size:9px">${node.children
                    ? `<i class="fas fa-angle-up"></i>`
                    : `<i class="fas fa-angle-down"></i>`
                    }</span> ${node.data._directSubordinates}  </div>`;
            })
            .onNodeClick(d => this.redireccionarOrganigrama(d))
            .nodeContent(function (d, i, arr, state) {
                return `
            <div style="padding-top:30px;background-color:none;margin-left:1px;height:${d.height
                    }px;border-radius:2px;overflow:visible">
              <div style="height:${d.height - 32
                    }px;padding-top:0px;background-color:white;border:1px solid lightgray;">

                <img src="${d.data.imageUrl
                    }" style="margin-top:-30px;margin-left:${d.width / 2 - 30}px;border-radius:100px;width:60px;height:60px;" />


               <div style="margin-top:-30px;background-color:${d.data.color};height:10px;width:${d.width - 2
                    }px;border-radius:1px"></div>

               <div style="padding:20px; padding-top:35px;text-align:center">
               <div style="color:#404040;font-size:16px;margin-top:4px"> ${d.data.positionName
                    } </div>
                   <div style="color:#111672;font-size:16px;font-weight:bold"> ${d.data.name
                    } </div>
               </div>
              </div>
      </div>
  `;
            })
            .render();
        this._changeDetectorRef.markForCheck();
    }

    expandirOrganigrama() {
        this.chart.zoomOut();
    }

    redireccionarOrganigrama(organigrama: string) {
        if (this.user.admin == 'administrador') {
            if (organigrama.includes("importador")) {
                const id = organigrama.replace("importador", "");
                this._router.navigate(['/gestion-importadores', id]);
            } else if (organigrama.includes("distribuidor")) {
                const id = organigrama.replace("distribuidor", "");
                this._router.navigate(['/gestion-distribuidores', id]);
            }
        }
    }

    styleFunc(feature) {
        return ({
            clickable: false,
            fillColor: "gray",
            strokeWeight: 1,
        });
    }

    buscarProducto() {
        const paginator = new Paginator();
        paginator.pageIndex = this.pageIndex;
        paginator.pageSize = this.pageSize;
        paginator.filter = this.filter || 'all';
        paginator.order = this.order;
        paginator.orderBy = this.orderBy;

        if (this.tipoBusqueda) {
            paginator.identificacion = this.administracionForm.get('identificacion').value;
            paginator.serial = null;
            paginator.filter = this.administracionForm.get('identificacion').value;
            this._gestionProductosService.getProductoPaginatorAvanzado(paginator).subscribe(data => {
                this.openBuscadorAvanzadoProductos(paginator);
            })
        } else {
            paginator.serial = this.administracionForm.get('identificacion').value;
            paginator.identificacion = null;
            paginator.filter = this.administracionForm.get('identificacion').value;
            this._gestionProductosService.getProductoPaginatorAvanzado(paginator).subscribe(data => {
                this.openBuscadorAvanzadoProductos(paginator);
            })
        }


    }


    /**
    * Open productos avanzado dialog
    */
    openBuscadorAvanzadoProductos(paginator: Paginator): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorAvanzadoProductosComponent, {
            data: {
                paginator: paginator,
                externo: false,
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

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

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // Github issues
        this.chartGithubIssues = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                background: {
                    borderWidth: 0
                }
            },
            grid: {
                borderColor: 'var(--fuse-border)'
            },
            labels: this.data.githubIssues.labels,
            legend: {
                show: false
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            series: this.data.githubIssues.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75
                    }
                }
            },
            stroke: {
                width: [3, 0]
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    color: 'var(--fuse-border)'
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                tooltip: {
                    enabled: false
                }
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                }
            }
        };

        // Task distribution
        this.chartTaskDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'polarArea',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            labels: this.data.taskDistribution.labels,
            legend: {
                position: 'bottom'
            },
            plotOptions: {
                polarArea: {
                    spokes: {
                        connectorColors: 'var(--fuse-border)'
                    },
                    rings: {
                        strokeColor: 'var(--fuse-border)'
                    }
                }
            },
            series: this.data.taskDistribution.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75
                    }
                }
            },
            stroke: {
                width: 2
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#93C5FD',
                    shadeIntensity: 0.75,
                    shadeTo: 'dark'
                }
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                }
            }
        };

        // Budget distribution
        this.chartBudgetDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'radar',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: true,
                formatter: (val: number): string | number => `${val}%`,
                textAnchor: 'start',
                style: {
                    fontSize: '13px',
                    fontWeight: 500
                },
                background: {
                    borderWidth: 0,
                    padding: 4
                },
                offsetY: -15
            },
            markers: {
                strokeColors: '#818CF8',
                strokeWidth: 4
            },
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors: 'var(--fuse-border)',
                        connectorColors: 'var(--fuse-border)'
                    }
                }
            },
            series: this.data.budgetDistribution.series,
            stroke: {
                width: 2
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val: number): string => `${val}%`
                }
            },
            xaxis: {
                labels: {
                    show: true,
                    style: {
                        fontSize: '12px',
                        fontWeight: '500'
                    }
                },
                categories: this.data.budgetDistribution.categories
            },
            yaxis: {
                max: (max: number): number => parseInt((max + 10).toFixed(0), 10),
                tickAmount: 7
            }
        };

        // Weekly expenses
        this.chartWeeklyExpenses = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#22D3EE'],
            series: this.data.weeklyExpenses.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.weeklyExpenses.labels
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`
                }
            }
        };

        // Monthly expenses
        this.chartMonthlyExpenses = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#4ADE80'],
            series: this.data.monthlyExpenses.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.monthlyExpenses.labels
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`
                }
            }
        };

        // Yearly expenses
        this.chartYearlyExpenses = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#FB7185'],
            series: this.data.yearlyExpenses.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.yearlyExpenses.labels
            },
            yaxis: {
                labels: {
                    formatter: (val): string => `$${val}`
                }
            }
        };
    }
}

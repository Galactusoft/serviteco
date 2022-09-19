import { Injectable, Injector } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class GestionReportesService {

    constructor() {
    }

    // FUNCION QUE PERMITE EXPORTAR DOCUMENTO EN EXCEL
    exportAsExcelFile(obj: any[], excelFileName: string, customHead: string[], tipo: number): void {

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
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this._saveAsExcelFile(excelBuffer, excelFileName);

    }

    // FUNCION QUE PERMITE EXPORTAR DOCUMENTO EN EXCEL
    exportReportAsExcelFile(obj: any[], excelFileName: string, customHead: string[], customFooter: string[],): void {

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(obj);

        if (customHead.length > 0) {
            var heading = [customHead]
            XLSX.utils.sheet_add_aoa(worksheet, heading);
            var footering = [customFooter]
            XLSX.utils.sheet_add_aoa(worksheet, footering, { origin: {r:obj.length + 2, c:0} });
            var range = XLSX.utils.decode_range(worksheet['!ref'] || '');
            for (var C = range.s.r; C <= range.e.c; ++C) {
                var address = XLSX.utils.encode_col(C) + '1';
                if (!worksheet[address]) continue;
                worksheet[address].v = worksheet[address].v
            }
        }
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this._saveAsExcelFile(excelBuffer, excelFileName);

    }

    private _saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + '_' + new Date().getTime() + EXCEL_EXTENSION);
    }

}

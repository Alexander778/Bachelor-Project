import {Component, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {ExcelService} from './services/excel.service';
import * as XLSX from 'xlsx';
// import {extends} from 'tslint/lib/configs/latest';
import {MatTableDataSource} from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  keyWord = 'diploma';
  tryCounter = 3;
  length = [];
  temp = [];
  temp2 = [];
  final = [];
  objKeyDownProperty;
  objKeyUpProperty;
  objAttach;
  showTable = false;


  @ViewChild('TABLE') table: ElementRef;
  displayedColumns = ['user', 'try',
    'dH', 'diDD', 'diUD',
    'iH', 'ipDD', 'ipUD',
    'pH', 'plDD', 'plUD',
    'lH', 'loDD', 'loUD',
    'oH', 'omDD', 'omUD',
    'mH', 'maDD', 'maUD'];
  dataSource = new MatTableDataSource(timingData);


  constructor(private excelService: ExcelService,
              private elementRef: ElementRef) {
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#671567';
  }


  downKey(event: any) {
    this.keyDownKey(event.key, +(new Date()));
  }

  upKey(event: any) {
    this.keyUpKey(event.key, +(new Date()));
  }

  checkTyping(word: HTMLInputElement) {
    const _val = word.value;
    if (this.keyWord.indexOf(_val) === 0) {
    } else {
      word.value = '';
      if (this.tryCounter !== 1) {
        this.tryCounter--;
        this.temp = [];
        this.length = [];
      } else {
        alert('You failed');
        this.tryCounter = 0;
        this.temp = [];
        this.length = [];
        this.tryCounter = 3;
      }
    }

  }

  extend(obj, src) {
    for (let key in src) {
      if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
  }

  keyDownKey(key, date) {
    const down = date;
    this.temp.push({key, down});
    this.length.push(key);

  }

  keyUpKey(key, date) {
    const up = date;
    this.temp.push({up});
  }

  onCalculate(login: HTMLInputElement, word: HTMLInputElement) {
    // get try counter to import excel
    let objTry = {};
    switch (this.tryCounter) {
      case 3:
        objTry = {try: 1};
        break;
      case 2:
        objTry = {try: 2};
        break;
      case 1:
        objTry = {try: 3};
        break;
    }
    // reset counter on the form
    if (this.tryCounter === 2 || this.tryCounter === 1) {
      this.tryCounter = 3;
    }
    word.value = '';
    for (let i = 0; i < this.temp.length - 1; i = i + 2) {
      if (this.temp[i].down) {
        this.objKeyDownProperty = this.temp[i];
        this.objKeyUpProperty = this.temp[i + 1];
      } else {
        this.objKeyDownProperty = this.temp[i + 1];
        this.objKeyUpProperty = this.temp[i];
      }

      // divide like this because result was digit less than 0
      const hold = Math.abs((this.objKeyUpProperty.up - this.objKeyDownProperty.down) / 1000);
      const objReady = this.extend(this.objKeyDownProperty, this.objKeyUpProperty);
      objReady.hold = hold;
      // temp2 is array with up/down/hold time for each key
      this.temp2.push(objReady);
    }

    const objUser = {'user': login.value};

    this.final.push(objUser);
    if (this.temp2.length === 0) {
      objTry = {try: -1};
    }
    this.final.push(objTry);
    //
    for (let i = 0; i < this.temp2.length - 1; i++) {
      const firstLetter = this.temp2[i];
      const secondLetter = this.temp2[i + 1];
      const key = (firstLetter.key + secondLetter.key).toString();
      const keyHold = firstLetter.key + 'H';
      const keyDD = key + 'DD';
      const keyUD = key + 'UD';
      // prepare data for final array
      const firstLetterHold = +this.temp2[i].hold;
      const fsLettersDD = +(secondLetter.down - firstLetter.down) / 1000;
      const fsLettersUD = +(secondLetter.down - firstLetter.up) / 1000;
      //
      const obj = {[keyHold]: firstLetterHold, [keyDD]: fsLettersDD, [keyUD]: fsLettersUD};
      //
      this.final.push(obj);
    }

    // attaching objects to make one big object
    for (let i = 0; i < this.final.length; i++) {
      if (i === 0) {
        this.objAttach = this.extend(this.final[i], this.final[i + 1]);
      } else {
        this.objAttach = this.extend(this.objAttach, this.final[i]);
      }
    }

    timingData.push(this.objAttach);
    this.dataSource = new MatTableDataSource(timingData);
    this.temp = [];
    this.temp2 = [];
    this.final = [];
    login.value = '';
    this.showTable = true;
  }

  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'SheetJS.xlsx');

  }

}

export interface Element {
  user: string;

  dH: number;
  diDD: number;
  diUD: number;

  iH: number;
  ipDD: number;
  ipUD: number;

  pH: number;
  plDD: number;
  plUD: number;

  lH: number;
  loDD: number;
  loUD: number;

  oH: number;
  omDD: number;
  omUD: number;

  mH: number;
  maDD: number;
  maUD: number;
}

const timingData: Element[] = [];


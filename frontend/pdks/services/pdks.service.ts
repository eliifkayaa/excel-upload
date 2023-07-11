import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { Pdks } from '../models/pdks.model';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PdksService {
  private baseUrl = 'http://localhost:5000/api/pdks';

  // constructor(private http: HttpClient) { }

  // uploadFile(file: File): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('file', file, file.name);
  //   return this.http.post<any>(`${this.baseUrl}/upload`, formData, {
  //     reportProgress: true,
  //     observe: 'events',
  //   });
  // }

  // getPdksData(): Observable<Pdks[]> {
  //   return this.http.get<Pdks[]>(this.baseUrl);
  // }

  // deletePdksData(dosyaAdi: string): Observable<any> {
  //   return this.http.delete<any>(`${this.baseUrl}/${dosyaAdi}`);
  // }

  // fetchPdksData(): void {
  //   this.http.get<Pdks[]>(this.baseUrl).subscribe(
  //     pdksData => {
  //       this.pdksListSubject.next(pdksData); // pdksListSubject'ı güncelle
  //     },
  //     error => {
  //       console.error('Fetch error:', error);
  //     }
  //   );
  // }

  constructor(private http: HttpClient) {}

  uploadFiles(files: FileList): Observable<any> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }
    return this.http.post<any>(`${this.baseUrl}/upload`, formData);
  }

  getPdksData(): Observable<Pdks[]> {
    return this.http.get<Pdks[]>(this.baseUrl);
  }

  deletePdksData(fileName: string): Observable<Pdks[]> {
    return this.http.delete<Pdks[]>(`${this.baseUrl}/${fileName}`);
  }
}

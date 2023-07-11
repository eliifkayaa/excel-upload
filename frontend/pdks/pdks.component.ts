import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PdksService } from '../pdks/services/pdks.service';
import { Pdks } from './models/pdks.model';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pdks',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './pdks.component.html',
  styleUrls: ['./pdks.component.css']
})

export class PdksComponent implements OnInit {
  pdksList: Pdks[] = [];
  selectedFiles: FileList | null = null;
  pdksData: Pdks[] | null = null;
  fileNames: string[] = [];
  //selectedFile: File | null = null;

  // ngOnInit(): void {
  //   this.fetchPdksData();
  // }

  // onFileSelected(event: any): void {
  //   this.selectedFile = event.target.files[0] as File;
  // }

  // onUpload(): void {
  //   if (this.selectedFile) {
  //     this.pdksService.uploadFile(this.selectedFile).subscribe(
  //       event => {
  //         if (event.type === HttpEventType.UploadProgress) {
  //           const percentDone = Math.round((100 * event.loaded) / event.total);
  //           console.log(`Yükleme İlerlemesi: ${percentDone}%`);
  //         } else if (event.type === HttpEventType.Response) {
  //           console.log('Dosya yükleme tamamlandı.');
  //           this.selectedFile = null;
  //           this.fetchPdksData();
  //         }
  //       },
  //       error => {
  //         console.error('Upload error:', error);
  //       }
  //     );
  //   }
  // }

  // onDelete(pdks: Pdks): void {
  //   const dosyaAdi = pdks.dosyaAdi;
  //   this.pdksService.deletePdksData(dosyaAdi).subscribe(
  //     () => {
  //       // Silme işlemi başarılı oldu
  //       console.log('Dosya silindi.');
  //       this.pdksList = this.pdksList.filter(item => item.dosyaAdi !== dosyaAdi);
  //       this.fetchPdksData()
  //     },
  //     (error) => {
  //       // Silme işlemi başarısız oldu
  //       console.error('Delete error:', error);
  //     }
  //   );
  // }

  // private fetchPdksData(): void {
  //   this.pdksService.getPdksData().subscribe(
  //     pdksData => {
  //       this.pdksList = pdksData; // Tüm dosyaları alın
  //       // Dosya yollarını güncelle
  //       this.pdksList.forEach(pdks => {
  //         pdks.dosyaYolu = `${window.location.origin}/${pdks.dosyaYolu.replace(/\\/g, '/')}`;
  //       });
  //     },
  //     error => {
  //       console.error('Fetch error:', error);
  //     }
  //   );
  // }

  constructor(
    public pdksService: PdksService,
    private _toastr: ToastrService,) {}

  ngOnInit(): void {
    this.fetchPdksData();
  }

  onFilesSelected(event: any): void {
    this.selectedFiles = event.target.files;
  }

  onUpload(): void {
    if (this.selectedFiles) {
      this.pdksService.uploadFiles(this.selectedFiles).subscribe(
        (response: any) => {
          this._toastr.info("Dosya yükleme tamamlandı.");
          this.selectedFiles = null;
          this.fetchPdksData();
        },
        (error: any) => {
          this._toastr.error('Upload error:', error);
        }
      );
    }
  }

  openPdksData(fileName: string): void {
    this.pdksData = this.pdksList.filter(pdks => pdks.dosyaAdi === fileName);
  }

  onDelete(fileName: string): void {
    const pdks = this.pdksList.find(pdks => pdks.dosyaAdi === fileName);
    if (pdks) {
      this.pdksService.deletePdksData(pdks.dosyaAdi).subscribe(
        (pdksData: Pdks[]) => {
          // Silme işlemi başarılı oldu
          this._toastr.info("Dosya silindi.");
          if (this.pdksData && this.pdksData.length > 0) {
            this.pdksData = this.pdksData.filter(pdks => pdks.dosyaAdi !== fileName);
          }
          this.fetchPdksData();
        },
        (error: any) => {
          this._toastr.error('Delete error:', error);
        }
      );
    }
  }

  private fetchPdksData(): void {
    this.pdksService.getPdksData().subscribe(
      (pdksData: Pdks[]) => {
        this.pdksList = pdksData;
        this.fileNames = this.getFileNames(pdksData);
      },
      (error: any) => {
        this._toastr.error('Fetch error:', error);
      }
    );
  }

  private getFileNames(pdksData: Pdks[]): string[] {
    const uniqueFileNames: string[] = [];
    const fileNames: string[] = pdksData.map(pdks => pdks.dosyaAdi);
    fileNames.forEach(fileName => {
      if (!uniqueFileNames.includes(fileName)) {
        uniqueFileNames.push(fileName);
      }
    });
    return uniqueFileNames;
  }
}

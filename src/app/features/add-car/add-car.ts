import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../core/services/carService';
import { FileService } from '../../core/services/fileService';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';

@Component({
    selector: 'app-add-car',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './add-car.html',
    styleUrl: './add-car.css',
})
export class AddCar implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private carService = inject(CarService);
    private fileService = inject(FileService);
    private toastr = inject(ToastrService);
    private translate = inject(TranslateService);

    customerId = 0;
    plate = '';
    description = '';
    selectedFiles: File[] = [];
    isSubmitting = false;

    ngOnInit() {
        this.customerId = +this.route.snapshot.params['id'];
    }

    onFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const newFiles = Array.from(input.files);
            this.selectedFiles = [...this.selectedFiles, ...newFiles];
            // Dosyalar eklendikten sonra aynı dosyanın tekrar seçilebilmesi için input değerini sıfırla
            input.value = '';
        }
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    onSubmit() {
        if (!this.plate.trim() || this.isSubmitting) return;
        this.isSubmitting = true;

        // 1. Araba oluştur
        this.carService.createCar({
            plate: this.plate,
            description: this.description || undefined,
            customerId: this.customerId,
        }).subscribe({
            next: (res) => {
                if (res.success) {
                    const carId = res.data; // .NET'ten dönen carId

                    // 2. Dosya yoksa direkt bitir
                    if (this.selectedFiles.length === 0) {
                        this.toastr.success(this.translate.instant('ADD_CAR_PAGE.SUCCESS'));
                        this.goBack();
                        return;
                    }

                    // 3. Dosyaları sırayla (sequential) yükle (Concurrency / backend çökmesini önlemek için)
                    from(this.selectedFiles).pipe(
                        concatMap(f => this.fileService.upload(f)),
                        toArray()
                    ).subscribe({
                        next: (uploadResults: any[]) => {
                            // 4. Her yüklenen dosya için atamayı da sırayla yap
                            from(uploadResults).pipe(
                                concatMap((uploadRes: any) => {
                                    const fileId = uploadRes.data?.id || uploadRes.id;
                                    if (!fileId) {
                                        console.error('File ID could not be retrieved from upload response', uploadRes);
                                    }
                                    return this.fileService.assignOwner(fileId, carId, 'Car');
                                }),
                                toArray()
                            ).subscribe({
                                next: () => {
                                    this.toastr.success(this.translate.instant('ADD_CAR_PAGE.SUCCESS_WITH_FILES'));
                                    this.goBack();
                                },
                                error: (err) => {
                                    console.error('Assigning error:', err);
                                    this.toastr.warning(this.translate.instant('ADD_CAR_PAGE.FILE_ASSIGN_ERROR'));
                                    this.goBack();
                                }
                            });
                        },
                        error: (err) => {
                            console.error('Upload error:', err);
                            this.toastr.warning(this.translate.instant('ADD_CAR_PAGE.FILE_UPLOAD_ERROR'));
                            this.isSubmitting = false; // Hata durumunda butonu tekrar aç
                        }
                    });
                } else {
                    this.toastr.error(this.translate.instant('ADD_CAR_PAGE.ADD_ERROR'));
                    this.isSubmitting = false;
                }
            },
            error: () => {
                this.toastr.error(this.translate.instant('COMMON.ERROR_GENERIC'));
                this.isSubmitting = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['/mainpage/customer', this.customerId, 'assets']);
    }
}
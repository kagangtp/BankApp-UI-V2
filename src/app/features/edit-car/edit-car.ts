import { Component, inject } from '@angular/core';
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
    selector: 'app-edit-car',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './edit-car.html',
    styleUrl: './edit-car.css',
})
export class EditCar {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private carService = inject(CarService);
    private fileService = inject(FileService);
    private toastr = inject(ToastrService);
    private translate = inject(TranslateService);

    customerId = 0;
    carId = 0;
    plate = '';
    description = '';
    isSubmitting = false;
    images: any[] = [];
    selectedFiles: File[] = [];

    ngOnInit() {
        this.customerId = +this.route.snapshot.params['id'];
        this.carId = +this.route.snapshot.params['carId'];
        this.loadCar();
    }

    loadCar() {
        this.carService.getCarById(this.carId).subscribe(res => {
            if (res.success && res.data) {
                this.plate = res.data.plate;
                this.description = res.data.description || '';
                this.images = res.data.images || [];
            }
        });
    }

    imageToDelete: any = null;

    deleteImage(img: any) {
        this.imageToDelete = img;
    }

    confirmDelete() {
        if (!this.imageToDelete) return;

        this.fileService.deleteFile(this.imageToDelete.id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastr.success(this.translate.instant('TOAST.IMAGE_DELETED'));
                    this.images = this.images.filter(i => i.id !== this.imageToDelete.id);
                    this.imageToDelete = null;
                } else {
                    this.toastr.error(this.translate.instant('TOAST.IMAGE_DELETE_ERROR'));
                    this.imageToDelete = null;
                }
            },
            error: () => {
                this.toastr.error(this.translate.instant('TOAST.IMAGE_DELETE_EXCEPTION'));
                this.imageToDelete = null;
            }
        });
    }

    cancelDelete() {
        this.imageToDelete = null;
    }

    onFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const newFiles = Array.from(input.files);
            this.selectedFiles = [...this.selectedFiles, ...newFiles];
            input.value = '';
        }
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    onSubmit() {
        if (!this.plate.trim()) return;
        this.isSubmitting = true;

        this.carService.updateCar({
            id: this.carId,
            plate: this.plate,
            description: this.description || undefined,
        }).subscribe({
            next: (res) => {
                if (res.success) {
                    if (this.selectedFiles.length === 0) {
                        this.toastr.success(this.translate.instant('EDIT_CAR_PAGE.SUCCESS'));
                        this.goBack();
                        return;
                    }

                    // Sırayla (sequential) yükleme yapıyoruz (Hata vermemesi için)
                    from(this.selectedFiles).pipe(
                        concatMap(f => this.fileService.upload(f)),
                        toArray()
                    ).subscribe({
                        next: (uploadResults: any[]) => {
                            from(uploadResults).pipe(
                                concatMap((uploadRes: any) => {
                                    const fileId = uploadRes.data?.id || uploadRes.id;
                                    return this.fileService.assignOwner(fileId, this.carId, 'Car');
                                }),
                                toArray()
                            ).subscribe({
                                next: () => {
                                    this.toastr.success(this.translate.instant('EDIT_CAR_PAGE.SUCCESS'));
                                    this.goBack();
                                },
                                error: (err) => {
                                    console.error('Assigning error:', err);
                                    this.toastr.warning('Resimler yüklenirken hata oluştu.');
                                    this.goBack();
                                }
                            });
                        },
                        error: (err) => {
                            console.error('Upload error:', err);
                            this.toastr.warning('Resimler yüklenirken hata oluştu.');
                            this.isSubmitting = false;
                        }
                    });
                } else {
                    this.toastr.error(this.translate.instant('EDIT_CAR_PAGE.UPDATE_ERROR'));
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

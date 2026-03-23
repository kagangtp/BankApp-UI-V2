import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HouseService } from '../../core/services/houseService';
import { FileService } from '../../core/services/fileService';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';

@Component({
    selector: 'app-add-house',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './add-house.html',
    styleUrl: './add-house.css',
})
export class AddHouse {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private houseService = inject(HouseService);
    private fileService = inject(FileService);
    private toastr = inject(ToastrService);
    private translate = inject(TranslateService);

    customerId = 0;
    address = '';
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
        if (!this.address.trim()) return;
        this.isSubmitting = true;

        this.houseService.createHouse({
            address: this.address,
            description: this.description || undefined,
            customerId: this.customerId,
        }).subscribe({
            next: (res) => {
                if (res.success) {
                    const houseId = res.data;

                    if (this.selectedFiles.length === 0) {
                        this.toastr.success(this.translate.instant('ADD_HOUSE_PAGE.SUCCESS'));
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
                                    if (!fileId) {
                                        console.error('File ID could not be retrieved from upload response', uploadRes);
                                    }
                                    return this.fileService.assignOwner(fileId, houseId, 'House');
                                }),
                                toArray()
                            ).subscribe({
                                next: () => {
                                    this.toastr.success(this.translate.instant('ADD_HOUSE_PAGE.SUCCESS_WITH_FILES'));
                                    this.goBack();
                                },
                                error: () => {
                                    this.toastr.warning(this.translate.instant('ADD_HOUSE_PAGE.FILE_ASSIGN_ERROR'));
                                    this.goBack();
                                }
                            });
                        },
                        error: () => {
                            this.toastr.warning(this.translate.instant('ADD_HOUSE_PAGE.FILE_UPLOAD_ERROR'));
                            this.goBack();
                        }
                    });
                } else {
                    this.toastr.error(this.translate.instant('ADD_HOUSE_PAGE.ADD_ERROR'));
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

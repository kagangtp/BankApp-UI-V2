import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

// Services
import { CarService } from '../../core/services/carService';
import { HouseService } from '../../core/services/houseService';
import { CustomerService } from '../../core/services/customerService';
import { FileService } from '../../core/services/fileService';

// Models
import { Car } from '../../core/models/car';
import { House } from '../../core/models/house';
import { Customer } from '../../core/models/customer';

// Environment
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-customer-assets',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './customer-assets.html',
    styleUrl: './customer-assets.css',
})
export class CustomerAssets implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private carService = inject(CarService);
    private houseService = inject(HouseService);
    private customerService = inject(CustomerService);
    private filesService = inject(FileService);
    private toastr = inject(ToastrService);

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    // Default avatar yolu (assets klasöründeki gerçek yoluna göre düzenle)
    private readonly defaultAvatar = '/core/assets/images/default-avatar.png';

    customerId = 0;
    customer: Customer | null = null;
    cars: Car[] = [];
    houses: House[] = [];

    profileImageUrl = this.defaultAvatar;

    // Lightbox
    lightboxImage: string | null = null;
    lightboxAlt = '';

    ngOnInit() {
        this.customerId = +this.route.snapshot.params['id'];
        this.loadCustomer();
        this.loadCars();
        this.loadHouses();
    }

    /**
     * Gizli dosya girişini tetikler
     */
    triggerFileUpload() {
        this.fileInput.nativeElement.click();
    }

    /**
     * Dosya seçimi ve yükleme akışını yönetir
     */
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];

        // 1. Dosyayı yükle
        this.filesService.upload(file).subscribe({
            next: (uploadRes: any) => {
                // .NET ResponseWrapper yapısına göre ID'yi çekiyoruz
                const newFileId = uploadRes.data?.id || uploadRes.id;

                if (!newFileId) {
                    this.toastr.error("Dosya ID'si alınamadı.");
                    return;
                }

                // 2. Dosyayı Müşteriye bağla (ProfileImageId olarak)
                this.filesService.assignOwner(newFileId, this.customerId, 'Customer').subscribe({
                    next: (assignRes: any) => {
                        if (assignRes.success) {
                            this.toastr.success("Profil resmi güncellendi!");
                            this.loadCustomer(); // Yeni URL'i almak için reload
                        }
                    },
                    error: (err) => {
                        console.error('Assignment failed', err);
                        this.toastr.error("Resim atama işlemi başarısız.");
                    }
                });
            },
            error: (err) => {
                console.error('Upload failed', err);
                this.toastr.error("Dosya yüklenemedi.");
            }
        });
    }

    loadCustomer() {
        this.customerService.getCustomerById(this.customerId).subscribe(res => {
            if (res.success) {
                this.customer = res.data;
                // .NET artık tam Supabase URL'i döndüğü için direkt atama yapıyoruz
                this.profileImageUrl = this.customer?.profileImagePath
                    ? this.customer.profileImagePath
                    : this.defaultAvatar;
            }
        });
    }

    loadCars() {
        this.carService.getCarsByCustomer(this.customerId).subscribe(res => {
            if (res.success) {
                this.cars = res.data;
            }
        });
    }

    loadHouses() {
        this.houseService.getHousesByCustomer(this.customerId).subscribe(res => {
            if (res.success) {
                this.houses = res.data;
            }
        });
    }

    // --- Navigasyon Metodları ---
    goAddCar() { this.router.navigate(['/mainpage/customer', this.customerId, 'add-car']); }
    goAddHouse() { this.router.navigate(['/mainpage/customer', this.customerId, 'add-house']); }
    goEditCar(carId: number) { this.router.navigate(['/mainpage/customer', this.customerId, 'edit-car', carId]); }
    goEditHouse(houseId: number) { this.router.navigate(['/mainpage/customer', this.customerId, 'edit-house', houseId]); }
    goBack() { this.router.navigate(['/mainpage/customers']); }

    // --- Lightbox Metodları ---
    openLightbox(fullUrl: string, alt: string) {
        this.lightboxImage = fullUrl;
        this.lightboxAlt = alt;
    }
    closeLightbox() {
        this.lightboxImage = null;
    }

    downloadImage() {
        if (!this.lightboxImage) return;

        fetch(this.lightboxImage)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.lightboxAlt || 'download';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            })
            .catch(err => {
                console.error('Download error:', err);
                this.toastr.error('Resim indirilirken bir hata oluştu');
            });
    }

    handleImageError() {
        this.profileImageUrl = this.defaultAvatar;
    }

    // --- Deletion Logic ---
    assetToDelete: any = null;
    assetToDeleteType: 'Car' | 'House' | null = null;

    deleteAsset(asset: any, type: 'Car' | 'House') {
        this.assetToDelete = asset;
        this.assetToDeleteType = type;
    }

    confirmDeleteAsset() {
        if (!this.assetToDelete || !this.assetToDeleteType) return;

        if (this.assetToDeleteType === 'Car') {
            this.carService.deleteCar(this.assetToDelete.id).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.toastr.success('Araba ve dosyaları başarıyla silindi.');
                        this.loadCars();
                    } else {
                        this.toastr.error('Araba silinemedi.');
                    }
                    this.cancelDeleteAsset();
                },
                error: () => {
                    this.toastr.error('Bir hata oluştu.');
                    this.cancelDeleteAsset();
                }
            });
        } else if (this.assetToDeleteType === 'House') {
            this.houseService.deleteHouse(this.assetToDelete.id).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.toastr.success('Ev ve dosyaları başarıyla silindi.');
                        this.loadHouses();
                    } else {
                        this.toastr.error('Ev silinemedi.');
                    }
                    this.cancelDeleteAsset();
                },
                error: () => {
                    this.toastr.error('Bir hata oluştu.');
                    this.cancelDeleteAsset();
                }
            });
        }
    }

    cancelDeleteAsset() {
        this.assetToDelete = null;
        this.assetToDeleteType = null;
    }
}
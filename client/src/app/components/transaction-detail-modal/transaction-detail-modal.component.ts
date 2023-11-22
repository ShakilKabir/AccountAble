import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-transaction-detail-modal',
  templateUrl: './transaction-detail-modal.component.html',
})
export class TransactionDetailModalComponent {
  @Input() show: boolean = false;
  @Input() transaction: any;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}

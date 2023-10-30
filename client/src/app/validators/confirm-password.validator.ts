//confirm-password.validator.ts

import { FormGroup } from '@angular/forms';

export function ConfirmPasswordValidator(group: FormGroup): null | { notSame: boolean } {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { notSame: true };
}
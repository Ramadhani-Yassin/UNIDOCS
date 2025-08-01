import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'nl2br'
})
export class Nl2brPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    // Convert newlines to <br> tags and preserve other HTML
    const html = value
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '');
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
} 
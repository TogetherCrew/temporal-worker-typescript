export class DateHelper {
  public formatDate(date = new Date()): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}/${month}/${day}`;
  }
}

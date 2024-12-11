export class CamelizeTransformer {
  public transform(obj: any, toMerge?: any): any {
    if (Array.isArray(obj)) {
      return obj.map((o) => this.camelize(this.merge(o, toMerge)));
    } else {
      return this.camelize(this.merge(obj, toMerge));
    }
  }

  private merge(obj: any, toMerge?: any): any {
    return { ...obj, ...toMerge };
  }

  private toCamelCase(str: string): string {
    return str.replace(/([-_]\w)/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', ''),
    );
  }

  private camelize(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.camelize(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          key = this.toCamelCase(key);
          if (typeof value === 'string') {
            return [key, value];
          } else if (typeof value === 'number') {
            return [key, value];
          } else if (value === null) {
            return [key, null]
          } else {
            return [key, JSON.stringify(this.camelize(value))];
          }
        }),
      );
    }
    return obj;
  }
}

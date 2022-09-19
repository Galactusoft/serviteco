export interface TableColumn<T> {
  label: string;
  property: keyof T | string;
  type:
    | 'text'
    | 'image'
    | 'badge'
    | 'progress'
    | 'checkbox'
    | 'button'
    | 'boolean'
    | 'icon'
    | 'currency'
    | 'date'
    | 'dateTime'
    | 'tipoContenido'
    | 'toggleSlide'
    | 'toggleSlide2';
  visible?: boolean;
  cssClasses?: string[];
}

export interface FieldDeclarationUnsafe {
    type?: string;
    name?: string;
    label?: string;
    length?: number | string;
    required?: boolean;
    unique?: boolean;
    preview?: boolean;
    system?: boolean;
}

export interface FieldDeclaration {
    type: Nullable<string>;
    name: string;
    label?: string;
    length?: number | string;
    required?: boolean;
    unique?: boolean;
    preview?: boolean;
    system?: boolean;
}

export type Nullable<P> = P | null;

export type ExtractArrayItem<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ItemType)[] ? ItemType : never

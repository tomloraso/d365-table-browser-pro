/**
 * Parsed OData metadata types from D365 F&O $metadata endpoint.
 */

export interface ODataMetadata {
  entities: EntityDefinition[];
  enumTypes: EnumDefinition[];
  fetchedAt: number;
  environmentId: string;
}

export interface EntityDefinition {
  /** OData entity set name (e.g. "CustomersV3") */
  entitySetName: string;
  /** OData entity type name (e.g. "CustomerV3") */
  entityTypeName: string;
  /** Backing D365 table name from annotations, if available */
  tableName?: string;
  /** Entity label/description from annotations */
  label?: string;
  /** Fields/properties */
  properties: PropertyDefinition[];
  /** Navigation properties (relationships) */
  navigationProperties: NavigationProperty[];
  /** Key field names */
  keyFields: string[];
}

export interface PropertyDefinition {
  /** Field name */
  name: string;
  /** OData type (e.g. "Edm.String", "Edm.Int32", "Edm.DateTimeOffset") */
  type: string;
  /** Whether the field is nullable */
  nullable: boolean;
  /** Max length for string fields */
  maxLength?: number;
  /** If this is an enum field, the enum type name */
  enumTypeName?: string;
  /** Field label from annotations */
  label?: string;
}

export interface NavigationProperty {
  /** Navigation property name */
  name: string;
  /** Target entity type */
  targetEntityType: string;
  /** Whether it's a collection */
  isCollection: boolean;
}

export interface EnumDefinition {
  /** Enum type name */
  name: string;
  /** Enum members */
  members: EnumMember[];
}

export interface EnumMember {
  name: string;
  value: string;
}

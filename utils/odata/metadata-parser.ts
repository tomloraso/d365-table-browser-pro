import type {
  ODataMetadata,
  EntityDefinition,
  PropertyDefinition,
  NavigationProperty,
  EnumDefinition,
  EnumMember,
} from './types';

/**
 * Parse OData $metadata XML into typed structures.
 * Uses regex-based parsing (no DOMParser) so it works in service workers.
 *
 * D365 F&O metadata uses CSDL (Common Schema Definition Language) format.
 */
export function parseMetadataXml(
  xml: string,
  environmentId: string
): ODataMetadata {
  const enumTypes: EnumDefinition[] = [];
  const entityTypes = new Map<string, EntityTypeInfo>();
  const entitySets = new Map<string, string>(); // entitySetName -> entityTypeName

  // Extract all Schema blocks
  const schemaRegex = /<Schema\s[^>]*Namespace="([^"]*)"[^>]*>([\s\S]*?)<\/Schema>/gi;
  let schemaMatch: RegExpExecArray | null;

  while ((schemaMatch = schemaRegex.exec(xml)) !== null) {
    const namespace = schemaMatch[1];
    const schemaContent = schemaMatch[2];

    // Parse EnumTypes
    const enumRegex = /<EnumType\s[^>]*Name="([^"]*)"[^>]*>([\s\S]*?)<\/EnumType>/gi;
    let enumMatch: RegExpExecArray | null;
    while ((enumMatch = enumRegex.exec(schemaContent)) !== null) {
      const enumName = enumMatch[1];
      const enumContent = enumMatch[2];
      const members: EnumMember[] = [];

      const memberRegex = /<Member\s[^>]*Name="([^"]*)"(?:\s[^>]*Value="([^"]*)")?[^>]*\/?\s*>/gi;
      let memberMatch: RegExpExecArray | null;
      while ((memberMatch = memberRegex.exec(enumContent)) !== null) {
        members.push({
          name: memberMatch[1],
          value: memberMatch[2] ?? '',
        });
      }

      enumTypes.push({
        name: namespace ? `${namespace}.${enumName}` : enumName,
        members,
      });
    }

    // Parse EntityTypes
    const entityTypeRegex =
      /<EntityType\s[^>]*Name="([^"]*)"[^>]*>([\s\S]*?)<\/EntityType>/gi;
    let etMatch: RegExpExecArray | null;
    while ((etMatch = entityTypeRegex.exec(schemaContent)) !== null) {
      const info = parseEntityType(etMatch[1], etMatch[2], namespace);
      if (info) entityTypes.set(info.fullName, info);
    }

    // Parse EntityContainer -> EntitySet
    const containerRegex =
      /<EntityContainer[^>]*>([\s\S]*?)<\/EntityContainer>/gi;
    let containerMatch: RegExpExecArray | null;
    while ((containerMatch = containerRegex.exec(schemaContent)) !== null) {
      const containerContent = containerMatch[1];
      const entitySetRegex =
        /<EntitySet\s[^>]*Name="([^"]*)"[^>]*EntityType="([^"]*)"[^>]*\/?\s*>/gi;
      let esMatch: RegExpExecArray | null;
      while ((esMatch = entitySetRegex.exec(containerContent)) !== null) {
        entitySets.set(esMatch[1], esMatch[2]);
      }
    }
  }

  // Build EntityDefinitions by combining EntitySets with EntityTypes
  const entities: EntityDefinition[] = [];

  for (const [entitySetName, fullTypeName] of entitySets) {
    const typeInfo = entityTypes.get(fullTypeName);
    if (!typeInfo) continue;

    entities.push({
      entitySetName,
      entityTypeName: typeInfo.name,
      tableName: typeInfo.tableName,
      label: typeInfo.label,
      properties: typeInfo.properties,
      navigationProperties: typeInfo.navigationProperties,
      keyFields: typeInfo.keyFields,
    });
  }

  entities.sort((a, b) => a.entitySetName.localeCompare(b.entitySetName));

  return {
    entities,
    enumTypes,
    fetchedAt: Date.now(),
    environmentId,
  };
}

interface EntityTypeInfo {
  name: string;
  fullName: string;
  tableName?: string;
  label?: string;
  properties: PropertyDefinition[];
  navigationProperties: NavigationProperty[];
  keyFields: string[];
}

function parseEntityType(
  name: string,
  content: string,
  namespace: string
): EntityTypeInfo | null {
  const fullName = namespace ? `${namespace}.${name}` : name;

  // Parse Key fields
  const keyFields: string[] = [];
  const keyBlockMatch = content.match(/<Key>([\s\S]*?)<\/Key>/i);
  if (keyBlockMatch) {
    const propRefRegex = /<PropertyRef\s[^>]*Name="([^"]*)"[^>]*\/?\s*>/gi;
    let refMatch: RegExpExecArray | null;
    while ((refMatch = propRefRegex.exec(keyBlockMatch[1])) !== null) {
      keyFields.push(refMatch[1]);
    }
  }

  // Parse Properties
  const properties: PropertyDefinition[] = [];
  const propRegex =
    /<Property\s([^>]*)\/?\s*>/gi;
  let propMatch: RegExpExecArray | null;
  while ((propMatch = propRegex.exec(content)) !== null) {
    const prop = parseProperty(propMatch[1]);
    if (prop) properties.push(prop);
  }

  // Parse NavigationProperties
  const navigationProperties: NavigationProperty[] = [];
  const navRegex =
    /<NavigationProperty\s([^>]*)\/?\s*>/gi;
  let navMatch: RegExpExecArray | null;
  while ((navMatch = navRegex.exec(content)) !== null) {
    const nav = parseNavigationProperty(navMatch[1]);
    if (nav) navigationProperties.push(nav);
  }

  // Look for annotations (D365 specific)
  let tableName: string | undefined;
  let label: string | undefined;

  const annotationRegex =
    /<Annotation\s[^>]*Term="([^"]*)"[^>]*(?:String="([^"]*)")?[^>]*\/?\s*>/gi;
  let annMatch: RegExpExecArray | null;
  while ((annMatch = annotationRegex.exec(content)) !== null) {
    const term = annMatch[1];
    const stringVal = annMatch[2] ?? '';

    if (term.includes('TableName') || term.includes('DynamicsTable')) {
      tableName = stringVal;
    }
    if (term.includes('Label') || term.includes('Description')) {
      label = stringVal || label;
    }
  }

  return {
    name,
    fullName,
    tableName,
    label,
    properties,
    navigationProperties,
    keyFields,
  };
}

function parseProperty(attrs: string): PropertyDefinition | null {
  const name = getAttr(attrs, 'Name');
  const type = getAttr(attrs, 'Type');
  if (!name || !type) return null;

  const nullableAttr = getAttr(attrs, 'Nullable');
  const nullable = nullableAttr !== 'false';

  const maxLengthAttr = getAttr(attrs, 'MaxLength');
  const maxLength = maxLengthAttr ? parseInt(maxLengthAttr, 10) : undefined;

  // Check if it's an enum type
  let enumTypeName: string | undefined;
  if (type && !type.startsWith('Edm.')) {
    enumTypeName = type;
  }

  return {
    name,
    type: formatType(type),
    nullable,
    maxLength: maxLength && !isNaN(maxLength) ? maxLength : undefined,
    enumTypeName,
    label: undefined, // Annotations on properties are less common in D365 $metadata
  };
}

function parseNavigationProperty(attrs: string): NavigationProperty | null {
  const name = getAttr(attrs, 'Name');
  const type = getAttr(attrs, 'Type');
  if (!name || !type) return null;

  const isCollection = type.startsWith('Collection(');
  const targetEntityType = isCollection
    ? type.slice('Collection('.length, -1)
    : type;

  return { name, targetEntityType, isCollection };
}

/**
 * Extract an attribute value from an attribute string.
 */
function getAttr(attrs: string, name: string): string | undefined {
  const regex = new RegExp(`${name}="([^"]*)"`, 'i');
  const match = attrs.match(regex);
  return match ? match[1] : undefined;
}

/**
 * Format an OData type name for display.
 */
function formatType(type: string): string {
  if (type.startsWith('Edm.')) {
    return type.slice(4);
  }
  const lastDot = type.lastIndexOf('.');
  return lastDot >= 0 ? type.slice(lastDot + 1) : type;
}

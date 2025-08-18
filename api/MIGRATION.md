# TypeORM Migration Guide

This guide explains how to work with TypeORM migrations in this project.

## Migration Commands

```bash
# Generate a new migration (only requires migration name)
yarn migration:generate MigrationName

# Run all pending migrations
yarn migration:run

# Revert the most recently applied migration
yarn migration:revert
```

## Development Workflow

1. Make changes to entity files in `src/common/entities/`
2. Generate a migration:
   ```bash
   yarn migration:generate MigrationName
   ```
3. Review the generated migration file in `src/migrations/`
4. Run the migration:
   ```bash
   yarn migration:run
   ```

## Production Deployment

In production environments, migrations are automatically applied when the application starts. This is configured in `database.config.ts` with the setting:

```typescript
migrationsRun: process.env.NODE_ENV === 'production';
```

This means:

- During local development, you need to run migrations manually with `yarn migration:run`
- In production, pending migrations are executed on application startup

## Migration Tips

- Migrations are stored in `src/migrations/` with timestamp prefixes
- Each migration has `up()` and `down()` methods
  - `up()`: Applied when running migrations
  - `down()`: Applied when reverting migrations
- Always test migrations in a development environment before production
- Use descriptive names for migrations (e.g., `AddUserEmailIndex`, `CreateProductTable`)

## Common Migration Scenarios

### Adding a Column

```typescript
await queryRunner.addColumn(
  'users',
  new TableColumn({
    name: 'phone',
    type: 'varchar',
    length: '15',
    isNullable: true,
  }),
);
```

### Removing a Column

```typescript
await queryRunner.dropColumn('users', 'phone');
```

### Creating an Index

```typescript
await queryRunner.createIndex(
  'users',
  new TableIndex({
    name: 'IDX_USER_EMAIL',
    columnNames: ['email'],
  }),
);
```

### Adding Foreign Key

```typescript
await queryRunner.createForeignKey(
  'posts',
  new TableForeignKey({
    columnNames: ['userId'],
    referencedColumnNames: ['id'],
    referencedTableName: 'users',
    onDelete: 'CASCADE',
  }),
);
```

## Troubleshooting

- **Migration Conflicts**: If you have conflicts between local and remote migrations, stash your changes, pull the latest migrations, and reapply your changes
- **Failed Migrations**: Check the error message and fix the issue in your migration file
- **Manual SQL**: For complex operations, you can use raw SQL:
  ```typescript
  await queryRunner.query('UPDATE users SET role = "user" WHERE role IS NULL');
  ```

import { MigrationInterface, QueryRunner } from 'typeorm';
import { logger } from 'ew-internals';

/**
 * https://github.com/typeorm/typeorm/blob/master/docs/migrations.md
 */
export class Seed1517934720430 implements MigrationInterface {
    public async up(queryRunner: QueryRunner) {
        await queryRunner.connection.synchronize(false);

        logger.info('🌱 Seed migration applied');
    }

    // eslint-disable-next-line no-empty-function
    public async down() {}
}
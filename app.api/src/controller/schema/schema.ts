// @ts-ignore
import { Schema } from 'project-minimum-core';
import {
    Endpoint,
    Get,
    Put,
    Patch,
    BodyInput,
    ERROR_REQUEST,
    ERROR_INTERNAL,
    Result,
} from '@bucket-of-bolts/express-mvc';

import { InputContext } from '../../lib/type';
import SchemaService from '../../service/schema';
import { SchemaInputDTO } from './input.dto';

@Endpoint('/schema')
export class SchemaController {
    @Get(':type/:entity')
    public async getEntity(
        { type, entity } = { type: '', entity: '' },
        { runtime: { connectionManager } }: InputContext,
    ): Promise<Result> {
        const result = new Result();

        if (type !== 'draft' && type !== 'actual') {
            result.errors.push({
                message: 'Illegal schema type',
                code: 'illegal_schema_type',
                type: ERROR_REQUEST,
            });
            return result;
        }

        if (!connectionManager) {
            result.errors.push({
                message: 'No connection manager',
                code: 'no_connection_manager',
                type: ERROR_INTERNAL,
            });
            return result;
        }

        const schema = await SchemaService.load(type, connectionManager);
        if (schema) {
            result.data = schema.getEntity(entity);
        }

        if (!result.data) {
            result.status = 404;
        }

        return result;
    }

    @Get(':type')
    public async get(
        { type } = { type: '' },
        { runtime: { connectionManager } }: InputContext,
    ): Promise<Result> {
        const result = new Result();

        if (type !== 'draft' && type !== 'actual') {
            result.errors.push({
                message: 'Illegal schema type',
                code: 'illegal_schema_type',
                type: ERROR_REQUEST,
            });
            return result;
        }

        if (!connectionManager) {
            result.errors.push({
                message: 'No connection manager',
                code: 'no_connection_manager',
                type: ERROR_INTERNAL,
            });
            return result;
        }

        result.data = await SchemaService.load(type, connectionManager);

        return result;
    }

    @Put()
    public async commit(
        params: StringMap,
        { runtime: { connectionManager } }: InputContext,
    ): Promise<Result> {
        const result = new Result();

        if (!connectionManager) {
            result.errors.push({
                message: 'No connection manager',
                code: 'no_connection_manager',
                type: ERROR_INTERNAL,
            });
            return result;
        }

        // replace an actual schema with a draft
        const draftSchema = await SchemaService.load(
            'draft',
            connectionManager,
        );
        if (draftSchema) {
            return SchemaService.put('actual', draftSchema, connectionManager);
        }

        return result;
    }

    @Patch()
    @BodyInput(SchemaInputDTO)
    public async patch(
        params: StringMap,
        { body, runtime: { connectionManager } }: InputContext,
    ): Promise<Result> {
        if (!connectionManager) {
            const result = new Result();
            result.errors.push({
                message: 'No connection manager',
                code: 'no_connection_manager',
                type: ERROR_INTERNAL,
            });
            return result;
        }

        const schema = body.application.ts;
        return SchemaService.put(
            'draft',
            new Schema({ schema }).getSchema(), // todo: this makes a vulnerability, check if healthy before saving!!!
            connectionManager,
        );
    }
}
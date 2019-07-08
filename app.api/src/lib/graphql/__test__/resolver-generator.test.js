/**
 * https://github.com/sapegin/jest-cheat-sheet
 */

import ResolverGenerator from '../resolver-generator';
import DatabaseEntityManager from '../../database/entity-manager';
import { Schema } from 'project-minimum-core';
import schemaJSON from '../../../__test__/schema';
import {
    makeConnection,
    data as mockedData,
} from '../../../__test__/repository.mock';
import { makeAST } from '../../../__test__/apollo.mock';

let schema = null;
let databaseManager = null;
let repository = null;
let resolvers = null;
let connection = null;

describe('GQL Resolver Generator', () => {
    beforeAll(async () => {
        schema = new Schema({
            schema: schemaJSON,
            draft: true,
            version: 2,
        });
        databaseManager = new DatabaseEntityManager(schema);

        connection = makeConnection();
        repository = connection.getRepositoryByEntityName('important_person');

        resolvers = await ResolverGenerator.make(
            schema,
            databaseManager,
            connection,
        );
    });
    beforeEach(async () => {
        connection.cleanup();
    });

    it('get(): should produce the resolver', async () => {
        expect(resolvers[0].Query.ImportantPersonGet).toBeInstanceOf(Function);
    });

    it('get(): should report code missing', async () => {
        const get = resolvers[0].Query.ImportantPersonGet;

        // call with no parameters
        let result = await get({}, {});
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toEqual('code_missing');
    });

    it('get(): should report not found', async () => {
        const get = resolvers[0].Query.ImportantPersonGet;

        let result = await get({}, { code: '   does_not_exist' });
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toEqual('not_found');
        expect(repository.findOne.mock.calls[0][0]).toMatchObject({
            where: { code: 'does_not_exist' },
            select: ['id', 'code'],
        });
    });

    it('get(): should return effective data', async () => {
        const get = resolvers[0].Query.ImportantPersonGet;

        let result = await get(
            {},
            { code: '4ef6f520-d180-4aee-9517-43214f396609' },
            null,
            {},
        );
        expect(result.errors).toHaveLength(0);
        expect(result.data).toMatchObject({
            code: '4ef6f520-d180-4aee-9517-43214f396609',
            id: 1,
        });
    });

    it('get(): should limit the amount of selected fields', async () => {
        const get = resolvers[0].Query.ImportantPersonGet;

        let result = await get(
            {},
            { code: '4ef6f520-d180-4aee-9517-43214f396609' },
            null,
            makeAST('data', ['full_name', 'has_pets']),
        );
        expect(result.data).toMatchObject({
            code: '4ef6f520-d180-4aee-9517-43214f396609',
            full_name: 'Max Mustermann',
            has_pets: true,
            id: 1,
        });
    });

    it('find(): should produce the resolver', async () => {
        expect(resolvers[0].Query.ImportantPersonFind).toBeInstanceOf(Function);
    });

    it('find(): should return effective data', async () => {
        const find = resolvers[0].Query.ImportantPersonFind;

        let result = await find({}, {}, null, {});
        expect(result).toMatchObject({
            data: [
                { code: '4ef6f520-d180-4aee-9517-43214f396609', id: 1 },
                { code: '9e9c4ee3-d92e-48f2-8235-577806c12534', id: 2 },
                { code: '2a98f71a-a3f6-43a1-8196-9a845ba8a54f', id: 3 },
            ],
            errors: [],
            limit: 50,
            offset: 0,
        });
    });

    it('find(): should process limit and offset', async () => {
        const find = resolvers[0].Query.ImportantPersonFind;

        repository.find.mockClear();
        let result = await find(
            {},
            { limit: 1, offset: 1 },
            null,
            makeAST('data', ['full_name']),
        );

        expect(repository.find.mock.calls).toHaveLength(1);
        expect(result.limit).toEqual(1);
        expect(result.offset).toEqual(1);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].code).toEqual(
            '9e9c4ee3-d92e-48f2-8235-577806c12534',
        );
    });

    it('find(): should process page and pageCount', async () => {
        const find = resolvers[0].Query.ImportantPersonFind;

        repository.find.mockClear();
        let result = await find(
            {},
            { page: 2, pageSize: 1 },
            null,
            makeAST('data', ['full_name']),
        );

        expect(repository.find.mock.calls).toHaveLength(1);
        expect(result.limit).toEqual(1);
        expect(result.offset).toEqual(1);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].code).toEqual(
            '9e9c4ee3-d92e-48f2-8235-577806c12534',
        );
    });

    it('find(): should process sort order', async () => {
        const find = resolvers[0].Query.ImportantPersonFind;

        repository.find.mockClear();
        let result = await find(
            {},
            { sort: { full_name: 'ASC' } },
            null,
            makeAST('data', ['full_name']),
        );

        expect(repository.find.mock.calls[0][0].order).toMatchObject({
            full_name: 'ASC',
        });
    });

    it('find(): should control the maximum amount of items to return', async () => {
        const find = resolvers[0].Query.ImportantPersonFind;

        let result = await find({}, { limit: 1000 }, null, {});

        expect(result.data).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toMatchObject({
            code: 'limit_too_high',
            message: 'Limit too high',
        });
    });

    it('find(): should limit the amount of selected fields', async () => {
        const find = resolvers[0].Query.ImportantPersonFind;

        let result = await find(
            {},
            {},
            null,
            makeAST('data', ['full_name', 'has_pets']),
        );
        expect(result.data).toMatchObject([
            {
                code: '4ef6f520-d180-4aee-9517-43214f396609',
                full_name: 'Max Mustermann',
                has_pets: true,
                id: 1,
            },
            {
                code: '9e9c4ee3-d92e-48f2-8235-577806c12534',
                full_name: 'Mister Twister',
                has_pets: false,
                id: 2,
            },
            {
                code: '2a98f71a-a3f6-43a1-8196-9a845ba8a54f',
                full_name: 'Charley Bale',
                has_pets: false,
                id: 3,
            },
        ]);
    });

    it('find(): should return count by filter', async () => {
        const find = resolvers[0].Query.ImportantPersonFind;

        let result = await find({}, {}, null, makeAST('count', []));

        expect(result.errors).toHaveLength(0);
        expect(result.count).toEqual(3);
    });

    it('find(): should accept filter or search, but not both', async () => {
        const find = resolvers[0].Query.ImportantPersonFind;

        let result = await find(
            {},
            {
                filter: {},
                search: 'hello',
            },
            null,
            makeAST('count', []),
        );

        expect(result.data).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toMatchObject({
            code: 'search_filter_conflict',
            message: 'You can not set both search and filter at the same time',
        });
    });

    it('put(): should create a new item', async () => {
        const put = resolvers[0].Mutation.ImportantPersonPut;

        let result = await put(
            {},
            {
                data: {
                    full_name: 'hello!',
                    partner: '4ef6f520-d180-4aee-9517-43214f396609',
                    has_pets: false,
                    pets: [
                        '01f6f520-d180-4aee-9517-43214f396609',
                        '02f6f520-d180-4aee-9517-43214f396609',
                    ],
                },
            },
            null,
            {},
        );
        expect(result.errors).toHaveLength(0);
        expect(result.code).toHaveLength(36); // assigns a new code
        expect(result.data).toMatchObject({
            full_name: 'hello!',
            has_pets: false,
            partner: 1,
        });

        const importantPersonRepository = connection.getRepositoryByEntityName(
            'important_person',
        );

        // maps codes to ids on person repo (because of that "partner" field set)
        let codeToIdCall = importantPersonRepository.find.mock.calls[0];
        expect(codeToIdCall).toBeDefined();
        expect(codeToIdCall[0].where.code._value).toEqual([
            '4ef6f520-d180-4aee-9517-43214f396609',
        ]);
        expect(codeToIdCall[0].select).toEqual(['id', 'code']);

        // calls create to make a new item
        const createCall = importantPersonRepository.create.mock.calls[0];
        expect(createCall[0]).toMatchObject({
            full_name: 'hello!',
            has_pets: false,
            pets: [
                '01f6f520-d180-4aee-9517-43214f396609',
                '02f6f520-d180-4aee-9517-43214f396609',
            ],
            partner: 1,
        });

        // does not call findOne
        expect(importantPersonRepository.findOne.mock.calls).toHaveLength(0);

        // calls save
        const saveCall = importantPersonRepository.save.mock.calls[0];
        expect(saveCall[0]).toMatchObject({
            full_name: 'hello!',
            has_pets: false,
            pets: [
                '01f6f520-d180-4aee-9517-43214f396609',
                '02f6f520-d180-4aee-9517-43214f396609',
            ],
            partner: 1,
        });

        // now for "pet" entity
        const petRepository = connection.getRepositoryByEntityName('pet');

        // maps codes to ids on pet repo (because of that "pets" field set)
        codeToIdCall = petRepository.find.mock.calls[0];
        expect(codeToIdCall).toBeDefined();
        expect(codeToIdCall[0].where.code._value).toEqual([
            '01f6f520-d180-4aee-9517-43214f396609',
            '02f6f520-d180-4aee-9517-43214f396609',
        ]);
        expect(codeToIdCall[0].select).toEqual(['id', 'code']);

        const petsRepository = connection.getRepositoryByEntityName(
            'eq_ref_ba4ed80327568d335915e4452eb0703a',
        );
        const petsRepositoryQueryBuilder = petsRepository.queryBuilder;

        expect(petsRepositoryQueryBuilder.delete.mock.calls).toHaveLength(1);
        expect(petsRepositoryQueryBuilder.insert.mock.calls).toHaveLength(1);
        expect(
            petsRepositoryQueryBuilder.values.mock.calls[0][0],
        ).toMatchObject([
            { self: undefined, rel: 1 },
            { self: undefined, rel: 2 },
        ]);

        // two times - first for delete(), second - for insert()
        expect(petsRepositoryQueryBuilder.execute.mock.calls).toHaveLength(2);
    });

    it('put(): should update an existing item', async () => {
        const put = resolvers[0].Mutation.ImportantPersonPut;

        let result = await put(
            {},
            {
                code: '4ef6f520-d180-4aee-9517-43214f396609',
                data: {
                    full_name: 'hello!',
                },
            },
            null,
            {},
        );

        expect(result.errors).toHaveLength(0);
        expect(result.code).toEqual('4ef6f520-d180-4aee-9517-43214f396609');
        expect(result.data).toMatchObject({ full_name: 'hello!', id: 1 });

        const importantPersonRepository = connection.getRepositoryByEntityName(
            'important_person',
        );

        // check that findOne was called
        expect(importantPersonRepository.findOne.mock.calls).toHaveLength(1);
        expect(
            importantPersonRepository.findOne.mock.calls[0][0],
        ).toMatchObject({
            where: { code: '4ef6f520-d180-4aee-9517-43214f396609' },
            select: ['id'],
        });

        // check that create was not called
        expect(importantPersonRepository.create.mock.calls).toHaveLength(0);

        // check that merge was called
        expect(importantPersonRepository.merge.mock.calls).toHaveLength(1);

        // check that save was called
        const saveCall = importantPersonRepository.save.mock.calls[0];
        expect(saveCall[0]).toMatchObject({
            id: 1,
            full_name: 'hello!',
        });
    });

    it('put(): should not allow to set the code from the data argument', async () => {
        const put = resolvers[0].Mutation.ImportantPersonPut;

        let result = await put(
            {},
            {
                data: {
                    code: '4ef6f520-d180-4aee-9517-43214f396609',
                    full_name: 'hello!',
                },
            },
            null,
            {},
        );

        expect(result.errors).toHaveLength(0);
        expect(result.data).toMatchObject({ full_name: 'hello!' });
        expect(result.code).not.toEqual('4ef6f520-d180-4aee-9517-43214f396609');
    });

    it('put(): should not accept invalid data for saving', async () => {
        // todo
    });

    it('put(): should return an item only when it is asked', async () => {
        // todo
    });

    it('put(): should manage multiple relations', async () => {
        // todo
    });

    it('put(): should not touch any multiple relations if there were no changes', async () => {
        // todo
    });

    it('put(): should report when trying to update non-existing item', async () => {
        // todo
    });
});

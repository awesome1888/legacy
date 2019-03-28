import { wrapError } from 'ew-internals';
import { getRepository } from 'typeorm';
import SchemaEntity from '../entity/schema';
import Schema from '../lib/schema';

export default (app, params = {}) => {
    const { connectionManager } = params;

    /**
     * Get schema entity (draft or actual)
     */
    app.get(
        '/schema/:type/:entity',
        wrapError(async (req, res) => {
            const result = {
                errors: [],
                entity: null,
            };
            res.header('Content-Type', 'application/json');

            const entity = _.get(req, 'params.entity');
            let type = _.get(req, 'params.type');
            if (type !== 'draft' && type !== 'actual') {
                result.errors.push({
                    message: 'Illegal schema type',
                    code: 'illegal_schema_type',
                });
                res.status(400);
            } else {
                const schema = await Schema.load(type, connectionManager);
                result.entity = schema.getEntity(entity);
                res.status(200);
            }

            res.send(JSON.stringify(result));
        }),
    );

    /**
     * Get the entire schema (draft or actual)
     */
    app.get(
        '/schema/:type',
        wrapError(async (req, res) => {
            const result = {
                errors: [],
                structure: null,
            };
            res.header('Content-Type', 'application/json');

            const entity = _.get(req, 'params.entity');
            let type = _.get(req, 'params.type');
            if (type !== 'draft' && type !== 'actual') {
                result.errors.push({
                    message: 'Illegal schema type',
                    code: 'illegal_schema_type',
                });
                res.status(400);
            } else {
                result.structure = await Schema.load(type, connectionManager);
                res.status(200);
            }

            res.send(JSON.stringify(result));
        }),
    );

    /**
     * Commit the draft schema to the actual schema
     */
    app.put(
        '/schema',
        wrapError(async (req, res) => {
            const result = {
                errors: [],
            };
            res.header('Content-Type', 'application/json');

            // replace an actual schema with a draft, check first
            const connection = await connectionManager.getSystem();
            const repo = connection.getRepository(SchemaEntity);

            let draft = await repo.findOne({
                draft: true,
            });

            if (draft) {
                const structure = draft.structure;
                const schema = new Schema(structure);
                result.errors = schema.checkHealth();

                if (!_.iane(result.errors)) {
                    let current = await repo.findOne({
                        draft: false,
                    });

                    if (current) {
                        repo.merge(current, {
                            structure,
                        });
                    } else {
                        current = repo.create({
                            draft: false,
                            structure,
                        });
                    }

                    await repo.save(current);

                    // todo: tell all nodes to re-start
                }
            }

            res.status(200).send(JSON.stringify(result));
        }),
    );

    /**
     * Save draft schema
     */
    app.patch(
        '/schema',
        wrapError(async (req, res) => {
            // save new schema as draft, check first
            const result = {
                errors: [],
            };

            const structure = _.get(req, 'body.structure');
            const schema = new Schema(structure);
            result.errors = schema.checkHealth();

            if (!_.iane(result.errors)) {
                const connection = await connectionManager.getSystem();
                const repo = connection.getRepository(SchemaEntity);

                let draft = await repo.findOne({
                    draft: true,
                });

                if (draft) {
                    repo.merge(draft, {
                        structure,
                    });
                } else {
                    draft = repo.create({
                        draft: true,
                        structure,
                    });
                }

                await repo.save(draft);
            }

            res.header('Content-Type', 'application/json')
                .status(200)
                .send(JSON.stringify(result));
        }),
    );
};
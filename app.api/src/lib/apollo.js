import { ApolloServer } from 'apollo-server-express';
import {
    renderPlaygroundPage,
} from '@apollographql/graphql-playground-html'
import { graphqlExpress } from './graphql-express';
import accepts from 'accepts';

import resolvers from '../graphql/resolvers/index';
import resolversB from '../graphql/resolvers/index-b';
import typeDefs from '../graphql/types/index';
import typeDefsB from '../graphql/types/index-b';

let server = null;

const getServer = async ({ cache }) => {
    if (!server || !(await cache.get('apollo.server.ready'))) {
        console.dir('Creating server');
        const flip = (Math.random() * 10) > 5;
        console.dir(flip);

        if (server) {
            await server.stop();
        }

        server = new ApolloServer({
            typeDefs: flip ? typeDefs : typeDefsB,
            resolvers: flip ? resolvers : resolversB,
            // context: async ({ req, res }) => {
            // },
            dataSources: () => {
                return {
                };
            },
            debug: __DEV__,
        });

        await cache.set('apollo.server.ready', true, ['apollo']);
    }

    return server;
};

export default (app, params = {}) => {
    // server.applyMiddleware({ app, cors: false });
    const { cache } = params;

    app.use('/graphql', async (req, res, next) => {
        if (__DEV__ && req.method === 'GET') {
            const accept = accepts(req);
            const types = accept.types();
            const prefersHTML =
                types.find(
                    x => x === 'text/html' || x === 'application/json',
                ) === 'text/html';

            if (prefersHTML) {
                res.setHeader('Content-Type', 'text/html');
                const playground = renderPlaygroundPage({
                    endpoint: '/graphql',
                });
                res.write(playground);
                res.end();
                return;
            }
        }

        const serverInstance = await getServer({ cache });
        return graphqlExpress(() => {
            return serverInstance.createGraphQLServerOptions(req, res);
        })(req, res, next);
    });
};

import '@babel/polyfill';
import { Settings } from 'ew-internals';
import path from 'path';
import helmet from 'helmet';
import express from 'express';

import useErrorHandler from './lib/error-handler';
import useCORS from './lib/cors';

// import { InterCom } from './lib/intercom';
import Cache from './lib/cache';
import ConnectionManager from './lib/database/connection-manager';

import useHomeAPI from './api/home';
import useGraphQL from './lib/graphql/apollo';
import useSchemaAPI from './api/schema';
import useSyncAPI from './api/sync';

(async () => {
    const app = express();
    const settings = new Settings();

    useErrorHandler(app);

    const host = await settings.get('network.host', 'localhost');
    const port = process.env.PORT || (await settings.get('network.port', 3000));

    app.set('host', host);
    app.set('port', port);
    // app.set('query parser', query => {
    //   return qs.parse(query, { allowPrototypes: false, depth: 10 });
    // });

    useCORS(app, settings);

    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use(helmet());
    app.use(express.json());
    app.use(
        express.urlencoded({
            extended: true,
        }),
    );

    const cache = await Cache.make({ settings });
    const connectionManager = new ConnectionManager({ settings });
    const systemConnection = await connectionManager.getSystem();
    await systemConnection.runMigrations();

    // const intercom = new InterCom({
    //     url: await settings.get('intercom.url', ''),
    // });
    // await intercom.start();

    useHomeAPI(app, { cache });
    useGraphQL(app, {
        settings,
        cache,
        connectionManager,
    });
    useSchemaAPI(app, { cache, connectionManager });
    useSyncAPI(app, {
        cache,
        connectionManager,
    }); // todo: temporary endpoint

    app.listen({ port }, () => {
        logger.info(
            `🚀 API server is ready at http://${host}:${port}`,
            !__TEST__,
        );
    });
})();

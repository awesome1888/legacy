import {
    applyMiddleware,
    compose,
    createStore as createRawStore,
    combineReducers,
} from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import { fork, all } from 'redux-saga/effects';
import logger from 'redux-logger';

import reducers from 'app.admin/common/store/reducers';
import sagas from 'app.admin/common/store/sagas';

export const createStore = ({ history, onChange }) => {
    const saga = createSagaMiddleware();
    const middleware = [routerMiddleware(history), saga];
    if (__DEV__) {
        middleware.push(logger);
    }
    const store = createRawStore(
        combineReducers(
            Object.assign(
                {
                    router: connectRouter(history),
                },
                reducers,
            ),
        ),
        {},
        compose(applyMiddleware(...middleware)),
    );
    saga.run(function*() {
        yield all(sagas.map(sagaItem => fork(sagaItem)));
    });

    let unsubscribe = null;
    if (_.isFunction(onChange)) {
        unsubscribe = store.subscribe(() => {
            onChange({ store, unsubscribe });
        });
    }

    return { store, saga, unsubscribe };
};

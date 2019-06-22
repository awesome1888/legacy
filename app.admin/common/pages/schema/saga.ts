import { takeLatest, put, call } from 'redux-saga/effects';
import * as reducer from './reducer';

function* load() {
    try {
        const data = {};
        yield put({ type: reducer.LOAD_SUCCESS, payload: { data } });
    } catch (error) {
        yield put({ type: reducer.LOAD_FAILURE, payload: [error] });
        if (__DEV__) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }
}

export default function* watcher() {
    yield takeLatest(reducer.LOAD, load);
}

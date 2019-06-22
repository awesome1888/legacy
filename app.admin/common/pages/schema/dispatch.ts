import { LOAD, UNLOAD } from './reducer';

export default dispatch => ({
    dispatch,
    dispatchLoad: client =>
        dispatch({
            type: LOAD,
            payload: {
                client,
            },
        }),
    dispatchUnload: () =>
        dispatch({
            type: UNLOAD,
        }),
});

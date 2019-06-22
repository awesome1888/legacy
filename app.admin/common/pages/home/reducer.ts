export const LOAD = 'home.load';
export const LOAD_SUCCESS = 'home.load.success';
export const LOAD_FAILURE = 'home.load.failure';
export const UNLOAD = 'home.unload';

const initialState = {
    loading: false,
    ready: false,
    error: null,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD:
            return { ...state, loading: true };
        case LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                ready: true,
                error: null,
                ...action.payload,
            };
        case LOAD_FAILURE:
            return {
                ...state,
                loading: false,
                ready: true,
                error: action.payload,
            };
        case UNLOAD:
            return { ...initialState };
        default:
            return state;
    }
};

export default reducer;

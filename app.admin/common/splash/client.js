export const dismissOnReady = ({ store, unsubscribe }) => {
    if (window.__splash) {
        const state = store.getState();
        if (state.application.ready) {
            const pageCodes = Object.keys(state);
            for (let i = 0; i < pageCodes.length; i++) {
                const pageCode = pageCodes[i];
                if (pageCode !== 'application' && state[pageCode].ready) {
                    window.__splash.dismiss();
                    window.splashProgressBarUnlocked = true;
                    unsubscribe();
                    break;
                }
            }
        }
    } else {
        unsubscribe();
    }
};

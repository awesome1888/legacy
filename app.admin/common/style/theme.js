import { palette, zIxEverest, zIxStratosphere, zIxSun } from 'sc-companion';

const grid = {
    resolution: 12,
    breakpoints: {
        xs: [null, 767], // max-width: 767
        sm: [768, 991], // min-width: 768 and max-width: 991
        md: [992, 1199], // min-width: 992 and max-width: 1199
        lg: [1200, null], // min-width: 1200
    },
};

const theme = {
    // general settings
    font: {
        normal: '1rem',
        small: '0.8rem',
        xSmall: '0.6rem',
    },
    grid,
    zIndex: {},

    // common elements
    body: {
        color: palette.black,
        background: {
            color: '#fafafa',
        },
    },
    link: {
        color: {
            hover: palette.sumacDyed,
            hout: palette.brightGoldenYellow,
        },
    },

    // custom elements
    error: {
        color: palette.monza,
    },
    input: {
        color: {
            hover: palette.sumacDyed,
            hout: palette.cascade,
            error: palette.monza,
        },
    },
    checkbox: {
        color: {
            hover: palette.sumacDyed,
            hout: palette.cascade,
            error: palette.monza,
        },
    },
    button: {
        color: {
            hover: palette.cascade,
            hout: palette.black,
        },
    },
    menu: {
        subHeader: {
            color: palette.cascade,
        },
    },
    footer: {
        background: {
            color: palette.harborRat,
        },
    },

    dropPanel: {
        zIndex: zIxEverest,
        panelVOffset: '0.5rem',
    },

    modal: {
        grid,
        cross: {
            color: {
                hover: palette.cascade,
                hout: palette.black,
            },
        },
        overlay: {
            zIndex: zIxStratosphere,
        },
    },

    notifications: {
        zIndex: zIxSun,
        message: {
            border: {
                color: palette.cascade,
            },
        },
    },

    progressBar: {
        bar: {
            color: palette.sumacDyed,
        },
        color: 'transparent',
    },
};

export default theme;

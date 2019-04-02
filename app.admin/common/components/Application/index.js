import React, { useEffect, useMemo } from 'react';
import { Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

import { LOAD } from './reducer';
import history from '../../lib/history'; // todo: deal with it, this is a singleton
import { GlobalStyle } from '../../style/global';
import { withSettings } from '../../lib/settings';

import HomePage from '../../pages/home';
import DataPage from '../../pages/data';
import StructurePage from '../../pages/structure';

const Application = ({ dispatch, ready, settings }) => {
    useEffect(() => {
        dispatch({
            type: LOAD,
            settings,
        });
    }, []);

    return (
        <>
            <GlobalStyle />
            {ready && (
                <ConnectedRouter history={history}>
                    <Switch>
                        <Route
                            exact
                            path="/"
                            render={route => <HomePage route={route} />}
                        />
                        <Route
                            exact
                            path="/data/:entity_name"
                            render={route => <DataPage route={route} />}
                        />
                        <Route
                            exact
                            path="/structure"
                            render={route => <StructurePage route={route} />}
                        />
                    </Switch>
                </ConnectedRouter>
            )}
        </>
    );
};

export default withSettings(connect(s => s.application)(Application));
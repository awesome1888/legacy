import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { LOAD } from './reducer';
import { withSettings } from '../../lib/settings';

import Button from '../../material-kit/CustomButtons';
import Layout from '../../components/Layout';

const HomePage = ({ dispatch, settings }) => {
    useEffect(() => {
        dispatch({
            type: LOAD,
            settings,
        });
    }, []);

    return (
        <Layout>
            <h1>Hello from Admin</h1>
        </Layout>
    );
};

export default withSettings(connect(x => x.home)(HomePage));
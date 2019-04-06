import styled from 'styled-components';
import { align, rectangle } from 'sc-companion';
import { Link } from 'react-router-dom';
import { withTheme } from '../../style/global';

export const Container = styled.div`
    ${align('top', 'stretch', 'column')}
    height: 100%;
`;

export const Top = styled.div`
    min-height: 3rem;
    flex-shrink: 0;
    border-bottom: 1px solid gray;
    padding: 1rem;
`;

export const Middle = styled.div`
    ${align('stretch', 'left')}
    flex-grow: 2;
`;

export const Footer = withTheme(styled.div`
    height: 5rem;
    flex-shrink: 0;
`);

export const Left = styled.div`
    width: 12rem;
`;

export const Right = styled.div`
    padding: 1rem 5rem 1rem 1rem;
    flex-grow: 2;
`;

export const Logo = styled(Link)`
    ${rectangle('2rem')}
    border: 1px solid gray;
    border-radius: 5px;
    display: block;
    text-align: center;
    text-decoration: none;
    color: gray;
`;

export const Header = styled.div`
    font-size: 1.5rem;
    margin-bottom: 1rem;
`;

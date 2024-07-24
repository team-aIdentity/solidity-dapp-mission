import React from 'react'
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Btn = styled.div`
    height: 50px;
    padding: 0 10px 0 10px;
    margin: 0 40px 0 40px;
    border-radius: 20px;
    display: flex; justify-content: center; align-items: center;
    color: white;
    font-weight: bold;
    font-size: x-large;
    text-shadow: -2px 0px #83B4FF, 0px 2px #83B4FF, 2px 0px #83B4FF, 0px -2px #83B4FF;
    cursor: pointer;

    &:hover {
        transform: scale(103%);
    }
`

const Button = ({text, path}) => {
    const nav = useNavigate();
    return (
        <Btn onClick={() => {nav(path)}}>{text}</Btn>
    )
}

export default Button

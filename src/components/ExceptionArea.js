import React from 'react';
import styled from 'styled-components';

import exceptionImage from '../assets/img/no_result.png';

const ExceptionArea = ({_title, _text}) => {
  return (
    <Exception>
      <img src={exceptionImage} alt="exception" />
      <h4>{_title}</h4>
      <p>{_text}</p>
    </Exception>
  )
}


const Exception = styled.div`
  text-align: center;
  line-height: 1.3;
  word-break: keep-all;
  h4{
    font-size: 24px;
    font-weight: 700;
    margin-top: 18px;
  }
  p{
      color: #676767;
      font-size: 16px;
      margin-top: 8px;
    }
`
export default ExceptionArea;
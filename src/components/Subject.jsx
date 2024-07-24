import React from 'react'
import styled from 'styled-components'

// styled
const SubjectContainer = styled.div`
    width: 100vw; height: 100px;
    display: flex; justify-content: center; align-items: center;
    font-size: xx-large;
    font-weight: bold;
    text-shadow: -2px 0px #83B4FF, 0px 2px #83B4FF, 2px 0px #83B4FF, 0px -2px #83B4FF;
    color: white;
    text-decoration: underline dotted 2px;
`

const Subject = ({text}) => {
  return (
    <SubjectContainer>
      {text}
    </SubjectContainer>
  )
}

export default Subject

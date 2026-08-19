import React from 'react';
import { useOrgStore } from '../../stores/orgStore';
import styled, { ThemeProvider } from 'styled-components';

const StyledComponent = styled.div<{ theme: any }>`
  background-color: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.textColor};
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const AnotherComponent: React.FC = () => {
  const { theme } = useOrgStore();

  return (
    <ThemeProvider theme={theme}>
      <StyledComponent>
        <h1>Responsive Themed Component</h1>
        <p>This component adapts to theme changes.</p>
      </StyledComponent>
    </ThemeProvider>
  );
};

export default AnotherComponent;
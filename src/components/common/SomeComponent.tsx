import React from 'react';
import { useOrgStore } from '../../stores/orgStore';

const SomeComponent: React.FC = () => {
  const { theme } = useOrgStore();

  const styles = {
    container: {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      padding: '20px',
      borderRadius: '5px',
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    content: {
      fontSize: '16px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome to the Themed Component</h1>
      <p style={styles.content}>
        This component adapts its styles based on the current theme.
      </p>
    </div>
  );
};

export default SomeComponent;
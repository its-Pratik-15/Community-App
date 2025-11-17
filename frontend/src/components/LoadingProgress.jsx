import { LinearProgress } from '@mui/material';

const LoadingProgress = ({ loading }) => {
  if (!loading) return null;
  
  return (
    <LinearProgress 
      color="primary" 
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999
      }} 
    />
  );
};

export default LoadingProgress;

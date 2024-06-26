//src/components/Error.js
import { Alert } from '@mui/material';

export default function Error({ message }) {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
  );
}
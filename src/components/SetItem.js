// src/components/SetItem.js
import Link from "next/link";
import { Box, Typography } from '@mui/material';

export default function SetItem({ set }) {
  return (
    <Box 
      key={set.id} 
      sx={{ 
        border: 1, 
        borderColor: 'grey.300', 
        borderRadius: 1, 
        p: 2, 
        boxShadow: 3, 
        bgcolor: 'background.paper',
      }} 
      role="listitem"
    >
      <Link href={`/sets/${set.id}`} style={{ textDecoration: 'none' }}>
        <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
          {set.setName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {set.setAbbreviation}
        </Typography>
      </Link>
    </Box>
  );
}
// src/components/CardItem.js
import Link from "next/link";
import Image from "next/image";
import { Box, Typography } from '@mui/material';

export default function CardItem({ card }) {
  return (
    <Box 
      key={card.id} 
      sx={{ 
        border: 1, 
        borderColor: 'grey.300', 
        borderRadius: 1, 
        p: 2, 
        boxShadow: 3, 
        bgcolor: 'background.paper', 
        position: 'relative' 
      }} 
      role="listitem"
    >
      <Link href={`/cards/${card.id}`} style={{ textDecoration: 'none' }}>
        <Box sx={{ 
          width: '100%', 
          paddingTop: '150%', // Aspect ratio 3:4
          position: 'relative', 
          mb: 2 
        }}>
          <Image
            src={card.cardImage}
            alt={card.cardName}
            layout="fill"
            objectFit="contain"
            style={{ borderRadius: '4px 4px 0 0' }} // Round top corners
          />
        </Box>
        <Typography variant="h6" component="h3" sx={{ color: 'text.primary' }}>
          {card.cardName}
        </Typography>
      </Link>
    </Box>
  );
}
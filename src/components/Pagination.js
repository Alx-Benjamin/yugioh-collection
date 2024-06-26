// src/components/Pagination.js
import { Pagination as MUIPagination } from '@mui/material';

export default function Pagination({ itemsPerPage, totalItems, paginate, currentPage }) {
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const handleChange = (event, value) => {
    paginate(value);
  };

  return (
    <MUIPagination 
      count={pageCount} 
      page={currentPage} 
      onChange={handleChange} 
      color="primary" 
      showFirstButton 
      showLastButton 
      sx={{ mt: 2 }} // Add some top margin
    />
  );
}
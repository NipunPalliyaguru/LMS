import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Grid, Pagination, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import { useGetStudentDataQuery } from './studentApiSlice';
import { setSearchTerm } from '../Search/Searchslice';
import { CardWrapper } from '../../Components/CardWrapper';
import Loading from '../../Components/Loading';
import Error from '../../Components/Error';
import { useParams } from 'react-router-dom';

export const Courses = () => {
  const { classId } = useParams(); // Retrieve classId from the URL parameters
  const { data, isLoading, isSuccess, isError, error } = useGetStudentDataQuery(classId); // Fetch studentData based on the ClassId

  const { searchTerm } = useSelector(setSearchTerm);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState('asc');

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleEnroll = (courseId) => {
    // Handle the enrollment logic here
    console.log(`Enrolling in course with ID: ${courseId}`);
    // You might call an API to enroll the student in the course
  };

  const filteredData = data?.assignments?.filter((item) => {
    const term = searchTerm ?? '';
    if (term.trim() === '') return true;
    return (
      (item.subject && item.subject.toLowerCase().includes(term.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(term.toLowerCase())) ||
      (item.lastDate && item.lastDate.includes(term)) ||
      (item.assignedBy && item.assignedBy.toLowerCase().includes(term.toLowerCase()))
    );
  });

  const sortedData = filteredData?.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.subject.localeCompare(b.subject);
    } else {
      return b.subject.localeCompare(a.subject);
    }
  });

  const paginatedData = sortedData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  let content;

  if (isLoading) {
    content = <Loading open={isLoading} />;
  } else if (isSuccess) {
    content = (
      <CardWrapper title='Courses'>
        <Box sx={{ width: '100%', marginTop: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortOrder} onChange={handleSortChange} label="Sort By">
                <MenuItem value="asc">Subject (A-Z)</MenuItem>
                <MenuItem value="desc">Subject (Z-A)</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Items per page</InputLabel>
              <Select value={itemsPerPage} onChange={handleItemsPerPageChange} label="Items per page">
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Grid container spacing={2}>
            {paginatedData?.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h3">{item.subject}</Typography>
                    <Typography variant="h3"><hr></hr></Typography>
                    <Typography variant="body2" align="justify">{item.description}</Typography>
                
                    <Typography variant="body2" mt={2}>Assigned by: {item.assignedBy}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleEnroll(item.id)}
                      >
                        Enrolled
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(filteredData.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Box>
      </CardWrapper>
    );
  } else if (isError) {
    content = <Error error={error} />;
  }
  return content;
};
